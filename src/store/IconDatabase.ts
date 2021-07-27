import Dexie from 'dexie';

interface Icon {
  id?: number;
  library: number;
  name: string;
  description: string;
  tags: string[];
  unicode: string;
  content: string;
}

interface IconLibrary {
  id?: number;
  name?: string;
  description?: string;
}

export interface CheckPoint {
  id?: string;
  name: string;
  time?: Date;
}

class IconDatabase extends Dexie {
  public icons: Dexie.Table<Icon, number>;
  public libraries: Dexie.Table<IconLibrary, number>;
  public checkpoints: Dexie.Table<CheckPoint, string>;

  public constructor() {
    super('IconDatabase');
    this.version(1).stores({
      icons: '++id,name,library,unicode',
      libraries: '++id,name',
      checkpoints: 'id,name,time',
    });
    this.icons = this.table('icons');
    this.libraries = this.table('libraries');
    this.checkpoints = this.table('checkpoints');
  }
}

export default IconDatabase;
