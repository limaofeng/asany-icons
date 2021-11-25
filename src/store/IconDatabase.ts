import Dexie from 'dexie';

import { CheckPoint, IconDefinition, IconLibraryDefinition, IconTagDefinition } from '../../types';

class IconDatabase {
  public tags: Dexie.Table<IconTagDefinition, number>;
  public icons: Dexie.Table<IconDefinition, string>;
  public libraries: Dexie.Table<IconLibraryDefinition, string>;
  public checkpoints: Dexie.Table<CheckPoint, string>;
  transaction: any;

  public constructor() {
    const db = new Dexie('IconDatabase');
    db.version(1).stores({
      tags: '++id,path,name,library,parentPath,[path+library]',
      icons: '++id,name,library,unicode,tags,[library+name],[library+unicode]',
      libraries: '++id,name,type',
      checkpoints: 'id,name,version',
    });
    this.tags = db.table('tags');
    this.icons = db.table('icons');
    this.libraries = db.table('libraries');
    this.checkpoints = db.table('checkpoints');

    this.transaction = db.transaction.bind(db);
  }
}

export default IconDatabase;
