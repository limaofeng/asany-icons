import Dexie from 'dexie';

export interface Icon {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  unicode: string;
  content: string;
  library: string;
}

export interface IconLibrary {
  id?: string;
  name?: string;
  description?: string;
  tags: IconTag[];
  icons: Icon[];
}

export interface IconTag {
  id?: number;
  path: string;
  name: string;
  parentPath?: string;
  library: string;
  count?: number;
}

export interface CheckPoint {
  id?: string;
  name: string;
  time?: Date;
}

class IconDatabase extends Dexie {
  public tags: Dexie.Table<IconTag, number>;
  public icons: Dexie.Table<Icon, string>;
  public libraries: Dexie.Table<IconLibrary, string>;
  public checkpoints: Dexie.Table<CheckPoint, string>;

  public constructor() {
    super('IconDatabase');
    this.version(1).stores({
      tags: '++id,path,name,library,parentPath,[path+library]',
      icons: '++id,name,library,unicode,tags,[library+name]',
      libraries: '++id,name',
      checkpoints: 'id,name,time',
    });
    this.tags = this.table('tags');
    this.icons = this.table('icons');
    this.libraries = this.table('libraries');
    this.checkpoints = this.table('checkpoints');
  }
}

export default IconDatabase;
