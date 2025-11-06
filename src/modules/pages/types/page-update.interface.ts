// create a new file: types/page-update.interface.ts
export interface PageChildUpdateDto {
  id?: number;
  title?: string;
  url?: string;
  content?: string;
  order?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: number;
}
