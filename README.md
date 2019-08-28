# UX Library Generator
A library to generate the majority of a UX library automatically through comments in the sass (.scss) files of components etc. To achieve the desired style and looks for the style guide, this readme will tell you how to use the ux library.

This project provides all assets, scripts and application files necessary to set up the Ergosign styleguide for a vanilla project.

The Style guide is versioned via npm so that a particular version can be used by a project.

## Table of Contents
1. [Getting started](#getting-started)
2. [Projects Involved](#projects-involved)
3. [Upgrading to the latest version](#upgrading-to-the-latest-version)
4. [Iframes](#iframes)
5. [Style Guide Comments](#style-guide-comments)
6. [Template](#template)
7. [Example](#example)


## Getting started
To use the stylguide in a vanilla project, follow the steps below:

### Installing the UX Library
1. First install the package from the previously configured nexus server by adding the desired UX Library version to the 'package.json' file and run `npm install`.

2. There exists an install script that will copy all relevant files into the desired project:
`npm explore ux-library-generator -- npm run install`

### Configuring the UX Library
The install script added a folder 'ux-library-config' to the root folder of the project where you can set general style, font and color settings used in your project
(reference config files: /src/styleguide/styleguide-data).

#### Site Json (Important)
The most important file for configuring the UX Library is the site.json file inside ux-library-config/data. You need to insert the relevant information and paths from your project.

`title`: The title that should be displayed in the UX Library.
`version`: Version number of the styleguide which is displayed in the header.
`componentPath`: Path in your project where .scss files containing UX Library comments are stored. Choose the toplevel folder that contains all the scss files that contain UX Library comments. For speeding up the development process also subfolders containing only a few components can be set here.
`overviewMarkdownFile`: A file (path) containing markdown, that will be displayed on the first page of the UX Library. Default is '<scssPath>/documentation/styleguide.md'
`targetPath`: Path where the generated UX Library should be stored. Currently no default value.
`assetPath`: Path where asset files for the UX Library are stored.
`imagePath`: Path where image files for the UX Library are stored.
`scssPath`: Path where style files for the UX Library are stored.
`examplePagesSourcePath`: Path where example pages in the project are stored. Example pages should be .hbs files with associated json files in the same directory with the same file name (only .json instead of .hbs) that provide their data. Default is 'src/html/pages'.
`examplePagesTargetPath`: Path where the rendered example pages should be stored. Default is 'www/examples'.
`templateName`: Name of the template that is used to build the regular styleguide pages. Default is 'style-guide-layout.hbs'.
`templateNameIframe`: Name of the template that is used to build the content of the iframes that hold the components in the styleguide. The given template will be rendered as a separate html file. If iframes are disabled, the content of this layout will be rendered into the regular styleguide template as a partial. Default is 'iframe-content.hbs'.
`alternativeTemplateNameIframe`: Name of the template that is used to build the content of an alternative iframe. This can be used if different technologies are displayed on the same styleguide page using alternative 
`gitlabStemUrl`: URL to the gitlab repository where the project files are stored. This URL is used to build hyperlinks from the styleguide to the actual source files.


The following npm scripts were also added to the project:

    "generate-ux-library": "ux-library-generator-copy-files && ux-library-generator-generate",
    "ux-library-serve": "grunt run",
    "start-ux-library": "ux-library-generator-copy-files && ux-library-generator-generate && concurrently \"ux-library-generator-generate watch\" \"npm run ux-library-serve\""

Start the styleguide by running the script 'start-ux-library' and open 'localhost:<port>' in the browser.

## Projects Involved
The style guide project is split up into a few separate projects described hereafter:
#### Styling and Javascript (Frontend) 
The styling (scss) and javascript of the style guide reside in the *kss-style-guide-ergosign-theme* project which is hosted on a private npm server at Ergosign.
 
#### Markup
The default markup files (templates) for the style guide are copied to .tmp/styleguide-data. You can override the default template files by placing your own files in the ux-library-config/layouts folder.

#### Style Guide Assembly
The necessary information on how to build the style guide from the .scss comments is collected and processed in the *ux-library-generator* project. It is published under an open source licence and is available as a public npm package. It's main task is to search for style guide comments in .scss files, process them and finally build the style guide structure.

## Upgrading to the latest version
Upgrading the style guide includes the following steps:
1. To access the private kss-style-guide-ergosign-theme package you need to configure your access to the Ergosign private npm server as described in the projects [readme file](README.md).
2. Add the following configuration options for the assemble task to your gruntfile and replace the instructions in angle brackets with the customer and project name (they will appear in the style guide header):
```
    assemble: {
        standard: {
            options: {
                partials: ['<%= yeoman.html_src %>/layouts/iframe-content.hbs'],
                kss: {
                    dataDestination: 'www/style-guide/data',
                    template: 'style-guide-layout.hbs',
                    templateIframe: 'iframe-content.hbs',
                    versionNumber: '<%= pgk.version %>',
                    customerName: <customer name as string> ,
                    projectName: <project name as string>
                }
            }
        }
    }
```
3. Install the packages using `npm install`
4. The style guide navigation is based on a two level navigation. First level sections will be rendered as a collapsable dropdown in the navigation bar containing the second level sections which are links to the specific controls. The structure may look like this:
```
Building Blocks
    Some Flyout
    Some Modal Dialog
Custom Controls
    Tooltip
```
5. Therefore it is necessary to group the controls in sections (e.g. Building Blocks). To create sections just place a style guide comment in the sections .scss file with the title and path to the section. The comment looks like this:
```
/*
Building Blocks
Styleguide Building Blocks
*/
```
6. Kick off the style guide generation using `grunt run ergosign-style-guide`. This task will copy the new markup files *style-guide-layout.hbs* and *iframe-content.hbs* for the style guide to a folder called html in the generated style guide folder (default is www/style-guide). Move them to src/html/layout (overwrite old style guide markup file).
7. Replace the name of the project specific javascript file at the end of both style guide markup files you previously copied with your projects javascript file name (the places are marked with TODOs).
8. Each example control in the style guide is now rendered into an iframe which allows for fast switching between different breakpoints. The iframes have default sizes that can be overriden by specifying the height for each control as described in section [Style Guide Comments](#style-guide-comments) or by specifying the breakpoints (width) as described in section [Iframes](#Iframes).

## Iframes
Each example control in the style guide is now rendered into an iframe which allows for fast switching between different breakpoints. The iframes have a default size that can be overridden by either specifying the height (for each control as a comment - see iframe-height in section [Style Guide Comments](#style-guide-comments)) or by specifying the width. To set custom widths for the iframes copy the *media-queries.json* file from www/style-guide/data to your projects src/html/data folder and adjust the breakpoints to fit your needs. You can also create the file by yourself using the following content:
```
{
    "mediaQueries": [
        {
            "name": "s",
            "to": "480"
        },
        {
            "name": "m",
            "to": "1024"
        },
        {
            "name": "l",
            "to": "1920"
        }
    ]
}
```

## Style Guide Comments
The structure of the style guide is defined using comments in the controls .scss files. A style guide comment contains at least the name of the section and information about how it is nested within its parent sections. The following parameters can be added to a style guide comment:

- The first line in the style guide comment is interpreted as the name of the section. This name will be displayed as the title of the section. The name stands alone and does not need any property name or prefix.
- *Styleguide* `<Section Name Level 1>.<Section Name Level 2>.<Section Name Level 3>` This comment specifies the position of the section within the other sections. The names of the sections are seperated using a dot and begin with the first level section. Each section name after a dot will result in a new subsection.
- *Markup*: `<string>` Name of the markup file that contains the markup of the component.
- *json-file*: `<string>` Name of the json file containing the handlebars data for the component.
- *no-iframe*: `<boolean>`
Prevents that the example control will be rendered in an iframe. By default all controls are rendered in iframes to enable the user to switch between the different breakpoints. In case the control does not need to be in an iframe (e.g. there are no different stylings for breakpoints) add this comment and set the value to true.
- *iframe-height*: `<number><unit>` || `<number><unit>, <number><unit>, <number><unit>`
Specifies the height of the iframe in which the example control will be rendered. If only a single size is given then all iframes will be the same height (smartphone, tablet and desktop). If you need different heights (maybe because on smartphones the control is much bigger than on tablet) then you can specify 3 heights separated with commas.

## Template
```
/*
Some Control

Markup: some-control.hbs

json-file: some-control.json
iframe-height: 

Styleguide Building Blocks.Some Control
*/
```

## Example
```
/*
Some Control

Markup: some-control.hbs

json-file: some-control.json
iframe-height: 300px, 200px, 100px

Styleguide Building Blocks.Some Control
*/
```
