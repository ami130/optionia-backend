// src/modules/website/types/website.types.ts

export interface WebsiteMeta {
  baseLogo: string;
  secondaryLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
}

export interface ButtonConfig {
  text: string;
  link: string;
  bgColor: string;
  textColor: string;
}

export interface IconConfig {
  id: string;
  icon: string;
  text: string;
  color: string;
  bgColor?: string;
}

export interface ContentBlock {
  heading: string;
  description: string;
  images?: string[];
  icons?: IconConfig[];
  buttons?: ButtonConfig[];
}

export interface SectionConfig {
  key: string;
  title: string;
  subtitle?: string;
  contents: ContentBlock[];
}

export interface PageConfig {
  key: string;
  websiteMeta: WebsiteMeta;
  sections: SectionConfig[];
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
  updatedBy?: string;
}

export type WebsiteData = PageConfig;
