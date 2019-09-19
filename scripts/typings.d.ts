

export interface Section {
  sectionName: string,
  sectionTitle: string,
  description: string,
  srcPath: string,
  level: number
}

export interface SiteJson {
  title: string;
  version: string;
  targetPath: string;
  gitlabStemUrl: string;
  dataFilesPath: string;
  partialsPath: string;
  layoutsPath: string;
  examplePagesTargetPath: string;
  examplePagesSourcePath: string;
  overviewMarkdownFile: string;
  assetPath: string;
  imagePath: string;
  scssPath: string;
  componentPath: string;
  templateName: string;
  templateNameIframe?: string;
  alternativeTemplateNameIframe?: string;
  alternative2TemplateNameIframe?: string;
  enableDeltaUpdates: boolean;
}

