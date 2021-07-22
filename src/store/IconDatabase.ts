import Dexie from 'dexie';

interface Icon {
  id?: number;
  name?: string;
  age?: number;
}

interface IconLibrary {
  id?: number;
  name?: string;
  age?: number;
}

class IconDatabase extends Dexie {
  public icons: Dexie.Table<Icon, number>;
  public libraries: Dexie.Table<IconLibrary, number>;

  public constructor() {
    super('IconDatabase');
    this.version(1).stores({
      icons: '++id,name,age',
      libraries: '++id,name,age',
    });
    this.icons = this.table('icons');
    this.libraries = this.table('libraries');
  }
}

export default IconDatabase;
