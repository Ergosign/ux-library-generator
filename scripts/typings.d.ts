

export interface Section {
  sectionName: string,
  sectionTitle: string,
  description: string,
  srcPath: string,
  level: number
}

export interface UxLibraryConfig {
  title: string;
  version: string;
  targetPath: string;
  gitlabStemUrl: string;
  dataFilesPath: string;
  partialsPath: string;
  layoutsPath: string;
  additionalHandlebarsHelpersPath: string;
  examplePagesTargetPath: string;
  examplePagesSourcePath: string;
  overviewMarkdownFile: string;
  assetSourcePath: string;
  assetTargetPath: string;
  imagePath: string;
  scssPath: string;
  componentPath: string;
  templateName: string;
  templateNameIframe?: string;
  alternativeTemplateNameIframe?: string;
  alternative2TemplateNameIframe?: string;
  enableDeltaUpdates: boolean;
}

