import Dexie from 'dexie';

import { CheckPoint, IconDefinition, IconLibraryDefinition, IconTagDefinition } from '../../types';

class IconDatabase extends Dexie {
  public tags: Dexie.Table<IconTagDefinition, number>;
  public icons: Dexie.Table<IconDefinition, string>;
  public libraries: Dexie.Table<IconLibraryDefinition, string>;
  public checkpoints: Dexie.Table<CheckPoint, string>;

  public constructor() {
    super('IconDatabase');
    this.version(1).stores({
      tags: '++id,path,name,library,parentPath,[path+library]',
      icons: '++id,name,library,unicode,tags,[library+name],[library+unicode]',
      libraries: '++id,name,type',
      checkpoints: 'id,name,time',
    });
    this.tags = this.table('tags');
    this.icons = this.table('icons');
    this.libraries = this.table('libraries');
    this.checkpoints = this.table('checkpoints');
  }
}

export default IconDatabase;
