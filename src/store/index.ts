import { ApolloClient, gql } from '@apollo/client';
import IconDatabase, {
  CheckPoint,
  Icon,
  IconLibrary,
  IconTag,
} from './IconDatabase';
import moment from 'moment';
import { xorWith } from 'lodash-es';
import { EventEmitter } from 'events';

const db = new IconDatabase();
const events = new EventEmitter();

const ALL_ICON_LIBRARIES = gql`
  {
    libraries: iconLibraries {
      id
      name
      description
      icons {
        id
        name
        tags
        unicode
        content
        description
      }
    }
  }
`;

const QUERY_CHECK_POINT = gql`
  query oplogs($filter: OplogFilter) {
    oplogs(filter: $filter) {
      id
      entityName
      operation
      primarykeyValue
    }
  }
`;

const QUERY_LIBRARIES = gql`
  query libraries($ids: [ID]) {
    libraries: iconLibraries(filter: { id_in: $ids }) {
      id
      name
      description
    }
  }
`;

const QUERY_ICONS = gql`
  query icons($ids: [ID]) {
    icons(filter: { id_in: $ids }) {
      id
      name
      tags
      unicode
      content
      description
      library: libraryId
    }
  }
`;

async function deltaKeys(logs: any[], table: Dexie.Table) {
  const tags = new Map<string, Set<string>>();
  // 移除已删除的数据
  const removeIds: number[] = logs
    .filter((item: any) => item.operation === 'DELETE')
    .map((item: any) => item.primarykeyValue);
  for (const id of removeIds) {
    const lost = await table.where({ id }).first();
    if (!lost) {
      continue;
    }
    if (table.name == db.icons.name) {
      if (!tags.has(lost.library)) {
        tags.set(lost.library, new Set<string>());
      }
      const zhis = tags.get(lost.library)!;
      lost.tags.forEach(zhis.add, zhis);
    }
    console.log('删除:', table.name, id);
    await table.delete(id);
    if (table.name == db.libraries.name) {
      await db.tags.bulkDelete(
        (await db.tags.where({ library: id }).toArray()).map(item => item.id!)
      );
    }
  }
  if (table.name == db.icons.name) {
    for (const [key, value] of tags) {
      parseTag([], key, Array.from(value));
    }
  }
  // 查询具体数据
  const updateIds = logs
    .filter(
      (item: any) =>
        (item.operation === 'UPDATE' || item.operation == 'INSERT') &&
        !removeIds.some(id => id === item.id)
    )
    .map((item: any) => item.primarykeyValue);
  return updateIds;
}

async function deltaUpdates(items: any[], table: Dexie.Table) {
  db.transaction('rw', db.icons, db.tags, db.libraries, async () => {
    const tags = new Map<string, Set<string>>();
    const lost = new Map<string, Set<string>>();
    for (const { __typename, ...item } of items) {
      if (table.name == db.icons.name) {
        if (!tags.has(item.library)) {
          tags.set(item.library, new Set<string>());
          lost.set(item.library, new Set<string>());
        }
        const zhis = tags.get(item.library)!;
        item.tags.forEach(zhis.add, zhis);
      }
      const original = await table.where({ id: item.id }).first();
      if (!original) {
        console.log('新增:', table.name, item);
        table.add({ ...item });
      } else {
        original.tags.forEach(
          lost.get(item.library)!.add,
          lost.get(item.library)
        );
        console.log('更新', table.name, item);
        table.update(item.id, { ...item });
      }
      if (table.name === db.icons.name) {
        const lib = await db.libraries.get(item.library);
        events.emit('icons:' + lib?.name + '/' + item.name, item);
      }
    }
    if (table.name == db.icons.name) {
      for (const [key, value] of tags) {
        const lostTags = xorWith(
          Array.from(value),
          Array.from(lost.get(key)!),
          Array.from(value)
        );
        parseTag(Array.from(value), key, lostTags);
      }
    }
  });
}

const updatePoint = async (time: Date, ...points: CheckPoint[]) => {
  db.transaction('rw', db.checkpoints, async () => {
    for (const point of points) {
      if (!!point.id) {
        await db.checkpoints.update(point.id, {
          time,
        });
      } else {
        await db.checkpoints.add({
          id: point.name.toLowerCase(),
          ...point,
          time,
        });
      }
    }
  });
};

const saveLibrary = async ({ icons, __typename, ...lib }: any) => {
  console.log('保存', db.libraries.name, lib.id, 'icons:', icons.length);
  await db.libraries.add({
    ...lib,
  });
  const tags = new Set<string>();
  for (const { __typename, ...icon } of icons) {
    icon.tags.forEach(tags.add, tags);
    await db.icons.add({ ...icon, library: lib.id });
    events.emit('icons:' + lib.name + '/' + icon.name, icon);
  }
  await parseTag(Array.from(tags), lib.id);
};

const parseTag = async (
  tags: string[],
  library: string,
  lost: string[] = []
) => {
  // 重新计算标签
  const _tags = new Set<string>();
  for (const tag of tags) {
    const paths = tag.split('/').reduce((c, _, index, array) => {
      c.push(array.slice(0, index + 1).join('/'));
      return c;
    }, [] as string[]);
    for (const path of paths) {
      _tags.add(path);
    }
  }
  for (const path of _tags) {
    // 统计数量
    const count = await db.icons
      .where({ library })
      .and(item =>
        item.tags.some(_t => _t.startsWith(path + '/') || _t === path)
      )
      .count();
    const exist = await db.tags.where({ path, library }).first();
    // 已存在
    if (exist) {
      await db.tags.update(exist.id!, { ...exist, count });
      console.log(
        '更新',
        db.tags.name,
        exist.path,
        'count: ',
        exist.count,
        '=>',
        count
      );
      continue;
    }
    // 不存在
    const lastIndex = path.lastIndexOf('/');
    await db.tags.add({
      path,
      name: lastIndex !== -1 ? path.substr(0, lastIndex) : path,
      parentPath: lastIndex !== -1 ? path.substr(0, lastIndex) : undefined,
      library,
      count,
    });
    console.log('新增', db.tags.name, path, 'count: ', count);
  }

  const _lostTags = new Set<string>();
  for (const tag of lost) {
    const paths = tag.split('/').reduce((c, _, index, array) => {
      c.push(array.slice(0, index + 1).join('/'));
      return c;
    }, [] as string[]);
    for (const path of paths) {
      _lostTags.add(path);
    }
  }
  const diff = xorWith(
    Array.from(_tags),
    Array.from(_lostTags),
    Array.from(_tags)
  );
  for (const path of diff) {
    const exist = await db.tags.where({ path, library }).first();
    if (!exist) {
      continue;
    }
    // 统计数量
    const count = await db.icons
      .where({ library })
      .and(item =>
        item.tags.some(_t => _t.startsWith(path + '/') || _t === path)
      )
      .count();
    if (!count) {
      await db.tags.delete(exist.id!);
      console.log('删除', db.tags.name, exist.path);
      continue;
    }
    await db.tags.update(exist.id!, { ...exist, count });
    console.log(
      '更新',
      db.tags.name,
      exist.path,
      'count: ',
      exist.count,
      '=>',
      count
    );
  }
};

export default {
  loadRemote: async (client: ApolloClient<any>) => {
    const now = new Date();

    let libraryIcon = await db.checkpoints.get('library');
    let pointIcon = await db.checkpoints.get('icon');
    // 首次加载
    if (!libraryIcon || !pointIcon) {
      await db.libraries.clear();
      await db.icons.clear();
      await db.checkpoints.clear();
      await db.tags.clear();

      const { data } = await client.query({
        query: ALL_ICON_LIBRARIES,
      });

      db.transaction('rw', db.libraries, db.icons, db.tags, async () => {
        for (const lib of data.libraries) {
          await saveLibrary(lib);
        }
      });

      await updatePoint(now, { name: 'icon' }, { name: 'library' });
      return;
    }

    // 查询增量数据
    const { data } = await client.query({
      query: QUERY_CHECK_POINT,
      variables: {
        filter: {
          entityName_in: ['Icon', 'IconLibrary'],
          createdAt_gt: moment(pointIcon.time).format('YYYY-MM-DD HH:mm:ss'),
        },
      },
    });

    const liblogs = data.oplogs.filter(
      (item: any) => item.entityName == 'IconLibrary'
    );

    const libIds = await deltaKeys(liblogs, db.libraries);

    if (libIds.length) {
      const {
        data: { libraries },
      } = await client.query({
        query: QUERY_LIBRARIES,
        variables: {
          ids: libIds,
        },
      });

      await deltaUpdates(libraries, db.libraries);
    }

    const iconlogs = data.oplogs.filter(
      (item: any) => item.entityName == 'Icon'
    );

    const iconIds = await deltaKeys(iconlogs, db.icons);

    if (iconIds.length) {
      const {
        data: { icons },
      } = await client.query({
        query: QUERY_ICONS,
        variables: {
          ids: iconIds,
        },
      });

      await deltaUpdates(icons, db.icons);
    }

    await updatePoint(now, pointIcon, libraryIcon);
  },
  libraries: async (...ids: string[]): Promise<IconLibrary[]> => {
    return await db.transaction(
      'readonly',
      db.libraries,
      db.icons,
      async () => {
        const libs = await (ids.length
          ? db.libraries.where('id').anyOf(ids)
          : db.libraries
        ).toArray();
        return libs;
      }
    );
  },
  icons: async (library: string, tag?: string): Promise<IconLibrary[]> => {
    return await db.transaction('readonly', db.icons, async () => {
      let where = db.icons.where({ library });
      if (tag) {
        where = where.and(item =>
          item.tags.some(_t => _t.startsWith(tag + '/') || _t === tag)
        );
      }
      return await where.toArray();
    });
  },
  tags: async (library: string): Promise<IconTag[]> => {
    return await db.transaction('readonly', db.tags, db.icons, async () => {
      return db.tags.where({ library }).toArray();
    });
  },
  on: (eventName: string, callback: (icon: Icon) => void): (() => void) => {
    events.on('icons:' + eventName, callback);
    return () => events.off('icons:' + eventName, callback);
  },
  get: (name: string): Promise<Icon | undefined> => {
    const [library, icon] = name.split('/');
    return db.transaction('readonly', db.libraries, db.icons, async () => {
      const lib = await db.libraries.where({ name: library }).first();
      if (!lib) {
        return undefined;
      }
      return db.icons.where({ library: lib!.id!, name: icon }).first();
    });
  },
};
