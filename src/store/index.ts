import { ApolloClient, gql } from '@apollo/client';
import IconDatabase, { CheckPoint } from './IconDatabase';
import moment from 'moment';

const db = new IconDatabase();

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
  // 移除已删除的数据
  const removeIds: number[] = logs
    .filter((item: any) => item.operation === 'DELETE')
    .map((item: any) => item.primarykeyValue);
  for (const id of removeIds) {
    console.log('删除:', table.name, id);
    await table.delete(id);
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
  db.transaction('rw', table, async () => {
    for (const { __typename, ...item } of items) {
      if ((await table.where({ id: item.id }).count()) == 0) {
        console.log('新增:', table.name, item);
        table.add({ ...item });
      } else {
        console.log('更新:', table.name, item);
        table.update(item.id, { ...item });
      }
    }
  });
}

export default async (client: ApolloClient<any>) => {
  const now = new Date();

  const updatePoint = async (...points: CheckPoint[]) => {
    db.transaction('rw', db.checkpoints, async () => {
      for (const point of points) {
        if (!!point.id) {
          await db.checkpoints.update(point.id, {
            time: now,
          });
        } else {
          await db.checkpoints.add({
            id: point.name.toLowerCase(),
            ...point,
            time: now,
          });
        }
      }
    });
  };

  const saveLibrary = async ({ icons, __typename, ...lib }: any) => {
    await db.libraries.add({
      ...lib,
    });
    for (const { __typename, ...icon } of icons) {
      db.icons.add({ ...icon, library: lib.id });
    }
  };

  let libraryIcon = await db.checkpoints.get('library');
  let pointIcon = await db.checkpoints.get('icon');
  // 首次加载
  if (!libraryIcon || !pointIcon) {
    await db.libraries.clear();
    await db.icons.clear();
    await db.checkpoints.clear();

    const { data } = await client.query({
      query: ALL_ICON_LIBRARIES,
    });

    db.transaction('rw', db.libraries, db.icons, async () => {
      for (const lib of data.libraries) {
        const library = await db.libraries.get(lib.id);
        if (!!library) {
          await db.libraries.update(library.id!, {
            name: lib.name,
            description: lib.description,
          });
        } else {
          await saveLibrary(lib);
        }
      }
    });

    await updatePoint({ name: 'icon' }, { name: 'library' });
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

  const iconlogs = data.oplogs.filter((item: any) => item.entityName == 'Icon');

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

  await updatePoint(pointIcon, libraryIcon);
};
