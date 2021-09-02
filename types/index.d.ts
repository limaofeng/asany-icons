/// <reference path="custom-typings.d.ts" />

export interface ParseIconFileError extends Error {
  data: string;
}

export interface IconDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  unicode: string;
  content: string;
  library: string;
}

export interface IconLibraryDefinition {
  id?: string;
  name?: string;
  description?: string;
  tags: IconTagDefinition[];
  icons: IconDefinition[];
  total?: number;
}

export interface IconTagDefinition {
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
