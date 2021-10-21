import { EventEmitter } from 'events';

import { ApolloClient, gql } from '@apollo/client';
import moment from 'moment';
import xorWith from 'lodash/xorWith';

import { parseIconFile } from '../utils';
import { CheckPoint, IconDefinition, IconLibraryDefinition, IconTagDefinition } from '../../types';

import IconDatabase from './IconDatabase';

const db = new IconDatabase();
const events = new EventEmitter();
events.setMaxListeners(1000);

const IMPORT_ICONS = gql`
  mutation($library: ID!, $icons: [IconInput]!) {
    icons: importIcons(library: $library, icons: $icons) {
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

export const ALL_ICON_LIBRARIES = gql`
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

export const QUERY_CHECK_POINT = gql`
  query oplogs($filter: OplogFilter) {
    oplogs(filter: $filter) {
      id
      entityName
      operation
      primarykeyValue
    }
  }
`;

export const QUERY_LIBRARIES = gql`
  query libraries($ids: [ID]) {
    libraries: iconLibraries(filter: { id_in: $ids }) {
      id
      name
      description
    }
  }
`;

export const QUERY_ICONS = gql`
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
    if (table.name === db.icons.name) {
      if (!tags.has(lost.library)) {
        tags.set(lost.library, new Set<string>());
      }
      const zhis = tags.get(lost.library)!;
      lost.tags.forEach(zhis.add, zhis);
    }
    console.log('删除:', table.name, id);
    await table.delete(id);
    if (table.name === db.libraries.name) {
      await db.tags.bulkDelete((await db.tags.where({ library: id }).toArray()).map(item => item.id!));
      await db.icons.bulkDelete((await db.icons.where({ library: id }).toArray()).map(item => item.id!));
    }
  }
  if (table.name === db.icons.name) {
    for (const [key, value] of tags) {
      parseTag([], key, Array.from(value));
    }
  }
  // 查询具体数据
  const updateIds = logs
    .filter(
      (item: any) =>
        (item.operation === 'UPDATE' || item.operation === 'INSERT') && !removeIds.some(id => id === item.id)
    )
    .map((item: any) => item.primarykeyValue);
  return updateIds;
}

async function deltaUpdates(items: any[], table: Dexie.Table) {
  db.transaction('rw', db.icons, db.tags, db.libraries, async () => {
    const tags = new Map<string, Set<string>>();
    const lost = new Map<string, Set<string>>();
    for (const { __typename, ...item } of items) {
      if (table.name === db.icons.name) {
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
        console.log('更新', table.name, item);
        if (table.name === db.icons.name) {
          original.tags.forEach(lost.get(item.library)!.add, lost.get(item.library));
        }
        table.update(item.id, { ...item });
      }
      if (table.name === db.icons.name) {
        const lib = await db.libraries.get(item.library);
        events.emit('icons:' + lib!.name + '/' + item.name, item);
      }
    }
    if (table.name === db.icons.name) {
      for (const [key, value] of tags) {
        const lostTags = xorWith(Array.from(value), Array.from(lost.get(key)!), Array.from(value));
        parseTag(Array.from(value), key, lostTags);
      }
    }
  });
  events.emit('change');
}

const updatePoint = async (time: Date | string, ...points: CheckPoint[]) => {
  db.transaction('rw', db.checkpoints, async () => {
    for (const point of points) {
      if (!!point.id) {
        await db.checkpoints.update(point.id, {
          version: time,
        });
      } else {
        await db.checkpoints.add({
          id: point.name.toLowerCase(),
          ...point,
          version: time,
        });
      }
    }
  });
};

const saveLibrary = async ({ icons, __typename, ...lib }: any) => {
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

const parseTag = async (tags: string[], library: string, lost: string[] = []) => {
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
      .and(item => item.tags.some(_t => _t.startsWith(path + '/') || _t === path))
      .count();
    const exist = await db.tags.where({ path, library }).first();
    // 已存在
    if (exist) {
      await db.tags.update(exist.id!, { ...exist, count });
      console.log('更新', db.tags.name, exist.path, 'count: ', exist.count, '=>', count);
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
  const diff = xorWith(Array.from(_tags), Array.from(_lostTags), Array.from(_tags));
  for (const path of diff) {
    const exist = await db.tags.where({ path, library }).first();
    if (!exist) {
      continue;
    }
    // 统计数量
    const count = await db.icons
      .where({ library })
      .and(item => item.tags.some(_t => _t.startsWith(path + '/') || _t === path))
      .count();
    if (!count) {
      await db.tags.delete(exist.id!);
      console.log('删除', db.tags.name, exist.path);
      continue;
    }
    await db.tags.update(exist.id!, { ...exist, count });
    console.log('更新', db.tags.name, exist.path, 'count: ', exist.count, '=>', count);
  }
};

class IconStore {
  private _client?: ApolloClient<any>;

  private _done?: () => void;

  private _wiating = new Promise(resolve => {
    this._done = resolve as any;
  });

  setClient(client: ApolloClient<any>) {
    this._client = client;
  }
  async loadRemote() {
    const now = new Date();

    let libraryIcon = await db.checkpoints.get('library');
    let pointIcon = await db.checkpoints.get('icon');
    // 首次加载
    if (!libraryIcon || !pointIcon) {
      await db.libraries.clear();
      await db.icons.clear();
      await db.checkpoints.clear();
      await db.tags.clear();

      this._done!();

      const { data } = await this._client!.query<{ libraries: IconLibraryDefinition[] }>({
        query: ALL_ICON_LIBRARIES,
      });

      await db.transaction('rw', db.libraries, db.icons, db.tags, async () => {
        for (const lib of data.libraries) {
          await saveLibrary({ ...lib, type: 'remote' });
        }
      });

      events.emit('change');

      await updatePoint(now, { name: 'icon' }, { name: 'library' });
      return;
    } else {
      this._done!();
    }

    // 查询增量数据
    const { data } = await this._client!.query({
      query: QUERY_CHECK_POINT,
      variables: {
        filter: {
          entityName_in: ['Icon', 'IconLibrary'],
          createdAt_gt: moment(pointIcon.version).format('YYYY-MM-DD HH:mm:ss'),
        },
      },
    });

    const liblogs = data.oplogs.filter((item: any) => item.entityName === 'IconLibrary');

    const libIds = await deltaKeys(liblogs, db.libraries);

    if (libIds.length) {
      const {
        data: { libraries },
      } = await this._client!.query<{ libraries: IconLibraryDefinition[] }>({
        query: QUERY_LIBRARIES,
        variables: {
          ids: libIds,
        },
      });

      await deltaUpdates(
        libraries.map(item => ({ ...item, type: 'remote' })),
        db.libraries
      );
    }

    const iconlogs = data.oplogs.filter((item: any) => item.entityName === 'Icon');

    const iconIds = await deltaKeys(iconlogs, db.icons);

    if (iconIds.length) {
      const {
        data: { icons },
      } = await this._client!.query({
        query: QUERY_ICONS,
        variables: {
          ids: iconIds,
        },
      });

      await deltaUpdates(icons, db.icons);
    }

    await updatePoint(now, pointIcon, libraryIcon);
  }
  async libraries(...ids: string[]): Promise<IconLibraryDefinition[]> {
    return await db.transaction('readonly', db.libraries, db.icons, db.tags, async () => {
      const libs = (await (ids.length ? db.libraries.where('id').anyOf(ids) : db.libraries).toArray()).map(item => ({
        ...item,
      }));

      for (const lib of libs) {
        lib.tags = await this.tags(lib.id!);
        lib.icons = await this.icons(lib.id!);
      }

      return libs;
    });
  }
  async icons(library: string, tag?: string): Promise<IconDefinition[]> {
    return await db.transaction('readonly', db.icons, async () => {
      let where = db.icons.where({ library });
      if (tag) {
        where = where.and(item => item.tags.some(_t => _t.startsWith(tag + '/') || _t === tag));
      }
      return await where.toArray();
    });
  }
  async tags(library: string): Promise<IconTagDefinition[]> {
    return await db.transaction('readonly', db.tags, db.icons, async () => {
      return db.tags.where({ library }).toArray();
    });
  }
  onChange(callback: () => void): () => void {
    events.on('change', callback);
    return () => events.off('change', callback);
  }
  on(eventName: string, callback: (icon: IconDefinition) => void): () => void {
    events.on('icons:' + eventName, callback);
    return () => events.off('icons:' + eventName, callback);
  }
  get(name: string): Promise<IconDefinition | undefined> {
    const [library, icon] = name.split('/');
    return db.transaction('readonly', db.libraries, db.icons, async () => {
      const lib = await db.libraries.where({ name: library }).first();
      if (!lib) {
        return undefined;
      }
      const iconByName = await db.icons.where({ library: lib!.id!, name: icon }).first();
      return iconByName || db.icons.where({ library: lib!.id!, unicode: icon }).first();
    });
  }
  async import(library: string, file: File) {
    const icons = await parseIconFile(file);
    const { data } = await this._client!.mutate({
      mutation: IMPORT_ICONS,
      variables: {
        library,
        icons,
      },
    });
    await deltaUpdates(data.icons, db.icons);
  }
  /**
   * 添加图标到本地图标库
   * @param icons 图标
   * @param library 图标库ID
   * @param version 版本
   */
  async addIcons(library: string, version: string, icons: IconCreateObject[]) {
    const lib = await this.local(library);
    if (!lib) {
      throw new Error(`库{${library}}未发现`);
    }
    let libCheckpoint = await db.checkpoints.get('library:' + library);
    if (!libCheckpoint) {
      db.checkpoints.add((libCheckpoint = { id: 'library:' + library, name: '本地库', version: '0' }));
    }
    if (version <= libCheckpoint.version!) {
      return;
    }
    await deltaUpdates(
      icons.map(({ svg: content, tags = [], ...item }) => ({
        ...item,
        id: `${library}-${item.name}`,
        tags,
        content,
        library,
      })),
      db.icons
    );
    updatePoint(version, libCheckpoint);
  }
  async local(id: string, info?: IconLibraryDefinition) {
    await this._wiating;
    let lib = await db.libraries.get(id);
    if (lib?.type === 'remote') {
      lib.tags = await this.tags(id);
      lib.icons = await this.icons(id);
      return lib;
    }
    if (!lib) {
      await saveLibrary({ name: id, ...info, id, type: 'local', icons: [] });
      lib = await db.libraries.get(id);
    } else if (!!lib && !!info) {
      db.transaction('rw', db.libraries, async () => {
        db.libraries.update(id, { name: id, ...info, type: 'local' });
      });
    }
    return lib;
  }
}

type IconCreateObject = {
  name: string;
  svg: string;
  tags?: string[];
};

export default IconStore;
