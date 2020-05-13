# Tooling

This document contains resources to help you in both the tooling and
development of the **visualize-it** project.


# At a Glance

- [NPM Scripts]
- [Dependencies]
- [Project Resources]
- [Project Setup]
  - [Setup GitHub Project]
  - [Setup Svelte Tooling]
  - [Setup UI Kit (SMUI)]
  - [Setup Absolute Imports]
  - [Setup Node Builtins]
  - [Setup Jest Unit Testing]
  - [Setup Documentation Tooling]
  - [Setup Deployment]

<!--- *** SECTION *************************************************************** --->
# NPM Scripts

This section provides a summary of the available **NPM Scripts**
_(organized by task)_:


```
DEVELOPMENT
===========
app:devServe ... launch dev server, with continuous build (watching for code changes)
                 http://localhost:5000/
                 NOTE: the internals of this script:
                       1. invokes the rollup bundler in a "watch" state (to: public/build)
                       2. implicitly invokes "npm start" to launch the server

docs:serve ..... AI: launch documentation server, continuously watching for docs changes

start .......... start a static file server from the contents of public/
                 http://localhost:5000/
                 NOTE: This is implicitly invoked from app:devServe script
                       As a result, it CANNOT be renamed :-(
                 NOTE: You can invoke this explicitly to server the contents of
                       a production build (i.e. app:prodBuild)


TESTING
=======
test ........... run test suite, one time
test:watch ..... run test suite, continuously watching for module changes


CODE QUALITY
============
app:lint ....... AI: verify code quality, linting BOTH production and test code
                 NOTE: Real-time linting is ALSO available in the VSCode editor.

app:check ...... AI: convenience script to:
                 - verify code quality (lint)
                 - show outdated installed packages
                 - run tests (against our master src)

pkgReview ...... AI: show outdated installed packages


DEPLOYMENT       NOTE: we DEPLOY the application
==========
app:deploy ..... AI: deploy latest application to https://visualize-it.js.org/app/
                 NOTE: This script FIRST builds the app from scratch
                       ... via preapp:deploy

app:prodBuild .. build production bundle (to: public/build)
                 NOTE: This is implicitly invoked from app:deploy


app:clean ...... AI: clean all machine-generated app/build directories


PUBLISH          NOTE: we PUBLISH the documentation
=======
docs:publish ... AI: publish the latest documentation to https://visualize-it.js.org/docs/
                 NOTE: this script FIRST builds the docs from scratch
                       ... via predocs:publish

                 >>> OPTIONALLY:
docs:build   ... AI: you can manually build the docs (into the _book/ dir)
                 HOWEVER it is not typically necessary 
                 BECAUSE this build is executed as the first step in docs:publish

docs:clean   ... AI: clean all machine-generated docs directories


MISC
====
clean .......... AI: cleans ALL machine-generated directories
```





<!--- *** SECTION *************************************************************** --->
# Dependencies

This section provides some insight regarding the various dependencies
found in **visualize-it**.

The dependency list can become quite large for a mature project.  In
looking at `package.json`, the inevitable questions are:

- What is this dependency

- Why is it needed

- Is it a dependency for project tooling or application code?

  This last bullet is especially poignant because all Svelte project
  dependencies are `devDependencies`, due to the fact that all run-time
  resources are bundled together by the Svelte compiler.

The following table itemizes the **visualize-it** dependencies,
referencing when/where they were introduced/configured.

Dependency                        | Type        | Usage                   | Refer To
--------------------------------- | ----------- | ----------------------- | ----------------
`@babel/core`                     | **TOOLING** | Jest Testing related    | [Setup Jest Unit Testing]
`@babel/preset-env`               | **TOOLING** | Jest Testing related    | [Setup Jest Unit Testing]
<del>`@rollup/plugin-alias`</del> | **TOOLING** | Absolute Imports        | [Setup Absolute Imports]
`@rollup/plugin-commonjs`         | **TOOLING** | Svelte Bundler related  | [Setup Svelte Tooling]
`@rollup/plugin-node-resolve`     | **TOOLING** | Svelte Bundler related  | [Setup Svelte Tooling]
`babel-jest`                      | **TOOLING** | Jest Testing related    | [Setup Jest Unit Testing]
`crc`                             | **APP**     | CRC Hashing Utility     | app code: `src/util/crc.js`
`enumify`                         | **APP**     | Enumeration Utility     | app code: `src/...`
`jest`                            | **TOOLING** | Jest Testing Framework  | [Setup Jest Unit Testing]
`konva`                           | **APP**     | Konva canvas 2D lib     | app code: `src/...`
`lodash.isequal`                  | **APP**     | Validation              | app code: `src/util/typeCheck.js`
`lodash.isfunction`               | **APP**     | Validation              | app code: `src/util/typeCheck.js`
`lodash.isobject`                 | **APP**     | Validation              | app code: `src/util/typeCheck.js`
`lodash.isplainobject`            | **APP**     | Validation              | app code: `src/util/typeCheck.js`
`lodash.isstring`                 | **APP**     | Validation              | app code: `src/util/typeCheck.js`
`rollup`                          | **TOOLING** | Svelte Bundler          | [Setup Svelte Tooling]
`rollup-plugin-livereload`        | **TOOLING** | Svelte Bundler related  | [Setup Svelte Tooling]
`rollup-plugin-node-builtins`     | **TOOLING** | Build some npm packages | [Setup Node Builtins]
`rollup-plugin-node-globals`      | **TOOLING** | Build some npm packages | [Setup Node Builtins]
`rollup-plugin-postcss`           | **TOOLING** | UI Kit related          | [Setup UI Kit (SMUI)]
`rollup-plugin-svelte`            | **TOOLING** | Svelte Bundler related  | [Setup Svelte Tooling]
`rollup-plugin-terser`            | **TOOLING** | Svelte Bundler related  | [Setup Svelte Tooling]
`sass`                            | **TOOLING** | UI Kit related          | [Setup UI Kit (SMUI)]
`sirv-cli`                        | **TOOLING** | A static file server    | [Setup Svelte Tooling]
`svelte`                          | **TOOLING** | Svelte Compiler         | [Setup Svelte Tooling]
`svelte-material-ui`              | **APP**<br>**TOOLING** | UI Kit       | app code: `src/...`<br>[Setup UI Kit (SMUI)]



<!--- *** SECTION *************************************************************** --->
# Project Resources

Wondering what some of the top-level file resources are?  Here is a
summary:

```
visualize-it/
  .git/ ................ our local git repo
  .gitignore ........... git repo exclusions (typically machine generated)
  _docs/ ............... machine generated docs [see: "AI"]
  babel.config.js ...... babel configuration used by jest  [see: "Setup Jest Unit Testing")
  docs/ ................ master source of our on-line docs [see: "AI"]
  jest.config.js ....... jest unit testing configuration [see: "Setup Jest Unit Testing")
  LICENSE.md ........... our MIT License
  node_modules/ ........ install location of dependent packages (maintained by npm)
  package.json ......... project meta data with dependencies
  package-lock.json .... exhaustive dependency list with installed "locked" versions (maintained by npm)
  public/ .............. the Svelte app deployment root (with generated build/) [see: "Setup Svelte Tooling"]
  README.md ............ basic project docs
  rollup.config.js ..... the rollup bundler configuration (used by Svelte) [see: "Setup Svelte Tooling"]
  src/ ................. the app source code
  TOOLING.md ........... this document :-)
```


<!--- *** SECTION *************************************************************** --->
# Project Setup

This section chronicles the original setup of the **visualize-it**
project.

If you are forking this project, this detail is _unnecessary_, because
you simply `npm install` and then commence your development.

With that said, this section provides valuable insight on how the
project was originally setup and configured, and can be used in other
projects _(where you are starting from scratch)_!

**NOTE**: These sections roughly represent the chronology of when they
were carried out, however in some cases the order can be changed.

**Sub Sections**:
  - [Setup GitHub Project]
  - [Setup Svelte Tooling]
  - [Setup UI Kit (SMUI)]
  - [Setup Absolute Imports]
  - [Setup Node Builtins]
  - [Setup Jest Unit Testing]
  - [Setup Documentation Tooling]
  - [Setup Deployment]



<!--- *** SUB-SECTION *************************************************************** --->
# Setup GitHub Project

There are many ways of initiating a new GitHub project. I'll leave the
details to you :-)

At the end of this process you should have:

- A new GitHub project
- A local git repository (for your development)
- Impacted Files:
  ```
    visualize-it/
      .git/ ................ our local git repo
      .gitignore ........... git repo exclusions (typically machine generated)
      README.md ............ basic project docs
  ```

_My personal notes are "hidden" (in comment form) in this doc ..._

<!--- Comment out KJB Notes
**Setup GitHub Project** _(KJB Notes)_:

```
> REFERENCE: Project Check List:
  ... see: openSourcePublishing.txt
           c:/data/tech/dev/openSourcePublishing.txt
> REFERENCE: GitHub Repo:
  ... see: GitHub.txt ... Create a Repository on GitHub (i.e. a project)
           c:/data/tech/dev/GitHub.txt

> ********************************************************************************
- create github repository: visualize-it
  * New Project:
    - Create a Repository on GitHub (i.e. a project)
      * from github page (https://github.com/KevinAst)
      * click + (by user name)
      * New Repository
      * repository name: visualize-it
      * description:     Your view into External Systems
      * Initialize this repository with a README
      * Add MIT License
      * click: Create repository
      * when project complete (very short time)
      * if you have exposed only a few of your github projects,
        expose this one (as needed) by pinning the project
      * click: Clone or download
               - Open in Desktop
                 * opens in my installed local GitHub Desktop
                 * select my local project directory: c:/dev/      
               - this clones your repository to your local computer
               - skip this step if you’re importing an existing repository
      * now available on my local computer
        - local file system:
          c:/dev/visualize-it> 
        - Github repository:
          https://github.com/KevinAst/visualize-it.git
      * adjust following files:
        > AUTOMATICALLY DONE:
          .git/
          LICENSE ... NOTE: rename to LICENSE.md
          README.md ... add basic notes WITH a work-in-progress indicator
      * check in / sync
        ... readme/license updates
      * verify README content on GitHub
      * add following topics (to github pages)
        ... astx geeku visualize-it
        ... NOT: pwa

 > ********************************************************************************
 - create branch: initial-tooling
```
KJB Notes --->



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Svelte Tooling

This task assumes you are "starting from scratch", setting up the
Svelte tooling _(the compiler, etc.)_, with the basic application code
template.

At the end of this process you should have:

- A running Svelte app _(a very basic template starting point)_

- Impacted Dependencies:
  ```
  @rollup/plugin-commonjs
  @rollup/plugin-node-resolve
  rollup
  rollup-plugin-livereload
  rollup-plugin-svelte
  rollup-plugin-terser
  sirv-cli
  svelte
  ```

- Impacted Files:
  ```
  visualize-it/
    node_modules/ ........ install location of dependent packages (maintained by npm)
    package.json ......... project meta data with dependencies
    package-lock.json .... exhaustive dependency list with installed "locked" versions (maintained by npm)
    public/ .............. the Svelte app deployment root (with generated build/) [see: "Setup Svelte Tooling"]
    rollup.config.js ..... the rollup bundler configuration (used by Svelte) [see: "Setup Svelte Tooling"]
    src/ ................. the app source code (the basic template starting point)
  ```

**Original Instructions**:
- [Getting started with Svelte](https://svelte.dev/blog/the-easiest-way-to-get-started#2_Use_degit)
  _(from the Svelte site - the horses mouth)_
- [Getting Started with Svelte 3](https://www.digitalocean.com/community/tutorials/getting-started-with-svelte-3)
  _(pretty much same instructions)_
- [Svelte Template Repo](https://github.com/sveltejs/template)


**Summary**:

Make a copy of the [Svelte Template Repo](https://github.com/sveltejs/template)
using [degit](https://github.com/Rich-Harris/degit) _(a Rich Harris tool that copies git repositories)_

```
- Summary Instructions:
  $ cd c:/dev
  $ npx degit sveltejs/template visualize-it
  $ cd visualize-it
  $ npm install
  $ npm run dev

  * Update package.json with any additional fields you may desire
    (description, homepage, repository, keywords, license, etc.)

  * Move sirv-cli FROM: dependencies TO: devDependencies (in package.json)
    ... unsure why template registers this as dependencies

- Summary of npm scripts:

  * start .......... start a static file server from the contents of public/
                     http://localhost:5000/
                     NOTE: This is implicitly invoked from app:devServe script
                           As a result, it CANNOT be renamed :-(
                     NOTE: You can invoke this explicitly to server the contents of
                           a production build (i.e. app:prodBuild)

                     >>> renamed FROM: dev
  * app:devServe ... launch dev server, with continuous build (watching for code changes)
                     http://localhost:5000/
                     NOTE: the internals of this script:
                           1. invokes the rollup bundler in a "watch" state (to: public/build)
                           2. implicitly invokes "npm start" to launch the server

                     >>> renamed FROM: build
  * app:prodBuild .. build production bundle (to: public/build)
                     NOTE: This is implicitly invoked from app:deploy
```

_My personal Detailed Notes are "hidden" (in comment form) in this doc ..._

<!--- Comment out KJB Notes
**Details**:
```
- create a new project
  $ cd c:/dev
  # copy template to your project root
  $ npx degit sveltejs/template visualize-it

- setup the new project
  $ cd visualize-it
  * edit package.json
    "name": "visualize-it",
    "version": "0.1.0",
  $ npm install
    added 74 packages from 130 contributors and audited 104 packages in 4.591s

    KJB NOTE: Svelte is the latest V3 (specified in template pkg: "svelte": "^3.0.0")
              Installed Svelte IS: 3.20.1

- configure static resources
  * public/index.html
    - change Title: visualize-it
    - change resource resolution FROM absolute TO relative, making it deployable in a relative directory
  * change the public/favicon.png to be visualize-it specific
    - define the various visualize-it icons
      public/
        visualize-it.png            ... our favicon
        visualize-it-logo.png       ... our logo
        visualize-it-logo-eyes.jpg  ... prying eyes
    - update index.html
      * reference visualize-it.png
    - delete template favicon.png

- configure VSCode
  * setup VSCode workspace file (and edit):
    c:/dev/visualize-it.code-workspace 
  * launch this workspace
  * ONE TIME: NOW load the VSCode "svelte" extension

- run the dev app
  $ npm run dev
  > NAVIGATE TO http://localhost:5000/

- you can now change code, and it is rebuilt

- ONE TIME: setup Svelte Dev Tools
  * install from chrome web store
  * KJB: has some visibility of props and state within the DOM
         * doesn't appear to have var names associated with each (they are like array indices ... hmmmm)

- FOR PRODUCTION BUILDS
  # build optimized lib
  $ npm run build
    ... creates:
        public/
          build/ <<< creates this new
            bundle.css
            bundle.css.map
            bundle.js
            bundle.js.map
  # can now run this production build
    ... uses sirv that includes your dependencies ... hmmm 
  $ npm run start
```
KJB Notes --->




<!--- *** SUB-SECTION *************************************************************** --->
# Setup UI Kit (SMUI)

**visualize-it** uses the [**Svelte Material UI Kit
(SMUI)**](https://sveltematerialui.com/) for it's UI.

**Links**:
- [web (demos)](https://sveltematerialui.com/)
- [npm](https://www.npmjs.com/package/svelte-material-ui) _(324 weekly downloads (in beta), 3,600 watches)_
- [repo](https://github.com/hperrin/svelte-material-ui)
- [Component Docs](https://github.com/hperrin/svelte-material-ui#components)
  are in the form in individual READMEs _(mostly just a short desc)_
  - here is the [component sample code](https://github.com/hperrin/svelte-material-ui/tree/master/site/src/routes/demo)
    _for the demos link (above)_
  - implementations for components that need to be _"Svelte-ified"_
  - otherwise, simply use the MDC package directly _(pre-installed with SMUI)_

At the end of this process you should have:

- The ability to use the SMUI components.

  ```
  <script>
    import Drawer from '@smui/drawer';
    ...
  </script>

  ... 

  <Drawer ... />
  ```

- Impacted Dependencies:
  ```
  rollup-plugin-postcss
  sass
  svelte-material-ui
  ```

- Impacted Files:
  ```
  visualize-it/
    rollup.config.js .............. modified to include SMUI configuration
    public/index.html ............. modified to include MDC fonts
    src/theme/_smui-theme.scss .... defining SMUI's app theme
  ```

**Installation Details**:

[Official Instructions here](https://github.com/hperrin/svelte-material-ui#installation) _(rather vague)_

- Install UI Kit:
  
  **NOTE**: I installed the entire lib, even though they recommend
            installing individual components ... _remember the build
            process should only include the components that are used
            in your code_!

  ```
  $ npm install --save-dev svelte-material-ui
    + svelte-material-ui@1.0.0-beta.21
      added 76 packages from 6 contributors and audited 2879 packages in 16.067s

    - NOTE: installed in same location as individual installs: 
            node_modules/@smui
  ```

- Configure `rollup.config.js` _(in support of SMUI)_

  The instructions are rather vague.  I ended up mimicking the contents of
  [`rollup.config.js` found in the demo site](https://github.com/hperrin/svelte-material-ui/blob/master/site/rollup.config.js).

  * edit `rollup.config.js`
    For details, see embedded comments:
    ```
    Sass Processor (used by Svelte Material UI (SMUI))
    ```

  * install Sass Processor

    ```
    $ npm install --save-dev sass
      + sass@1.26.3
        added 1 package from 1 contributor and audited 1134 packages in 2.463s
    ```

  * install the rollup postcss plugin

    ```
    $ npm install --save-dev rollup-plugin-postcss
      + rollup-plugin-postcss@2.8.2
        added 220 packages from 139 contributors and audited 1073 packages in 15.053s
    ```

- Define the SMUI Theme resource: `src/theme/_smui-theme.scss`
  * This is where you set the MDC theme variables. 
  * If it's empty, it will use the default theme values from MDC. 
  * See the [theme file in the demo site](https://github.com/hperrin/svelte-material-ui/blob/master/site/src/theme/_smui-theme.scss)
    for an example that uses Svelte colors.
  * Add `@import '@material/typography/mdc-typography';` to pull in the MDC Typography CSS classes

    **usage:**
    ```html
    <p class="mdc-typography--subtitle2">Hello</p>
    ```

- Define the MDC fonts (Material Icon, Roboto, and Roboto Mono fonts):

  ```
  public/index.html
  =================
  <!-- KJB: Material UI fonts (used by Svelte Material UI (SMUI))  -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
  ```


<!--- *** SUB-SECTION *************************************************************** --->
# Setup Absolute Imports

**NOTE**: Due to a bug in the [alias rollup
plugin](https://www.npmjs.com/package/@rollup/plugin-alias), resulting
in duplicate JS class definitions, we are currently **NOT** using
Absolute Imports _(details
[here](https://github.com/rollup/plugins/issues/296)
and
[here](https://stackoverflow.com/questions/61756633/svelte-compiler-generating-multiple-javascript-class-definitions))_

To alleviate the pain of relative path imports (for example):

```js
import TreeView  from "../../../../util/comp/TreeView.svelte";
```

We enable absolute imports, where tilde (`~/`) is the src root
(`src/`):

```js
import TreeView  from "~/util/comp/TreeView.svelte";
```


**Notes**:

- When using defined aliases, **you must supply the extensions**
  _(`.js`, `.svelte`, etc.)_

- You cannot prefix with `src/` out of the box _(without this
  alias utility)_.

- Currently our unit tests may not import any code that uses alias imports
  ... _because jest **does NOT** utilize rollup_

- You can define as many aliases as you like

- You can even employ regexp _(see [alias
  docs](https://www.npmjs.com/package/@rollup/plugin-alias) for
  details)_


**Links**:
- [Absolute Paths in Svelte](https://dev.to/sjafferi/absolute-paths-in-svelte-488c)
- [npm: @rollup/plugin-alias](https://www.npmjs.com/package/@rollup/plugin-alias)

At the end of this process you should have:

- The ability to utilize absolute imports.

- Impacted Dependencies:
  ```
  @rollup/plugin-alias
  ```

- Impacted Files:
  ```
  visualize-it/
    rollup.config.js ... modified to include alias configuration (Absolute Imports)
  ```


**Installation Details**:

- Install required dependencies (@rollup/plugin-alias):
  ```
  $ npm install --save-dev @rollup/plugin-alias
    + @rollup/plugin-alias@3.1.0
      added 1 package from 1 contributor and audited 266253 packages in 7.754s
  ```

- Configure `rollup.config.js` _(in support of **Absolute Imports**)_

  * For details, see embedded comments (`Absolute Imports`) in `rollup.config.js`

  * **rollup.config.js** _sample_
    ```js
    import alias from '@rollup/plugin-alias';  // KJB: in support of: Absolute Imports

    export default {
      ...
      plugins: [
        ...
        // KJB: Absolute Imports
        alias({
          entries: [
            // allow:      import TreeView  from "~/util/comp/TreeView.svelte";
            // instead of: import TreeView  from "../../../../util/comp/TreeView.svelte";
            { find: '~', replacement: 'src' },
          ]
        }),
      ]
    };
    ```


<!--- *** SUB-SECTION *************************************************************** --->
# Setup Node Builtins

Some npm packages utilize node builtins.  This requires some
additional rollup configuration!

I ran across this using the `crc` npm package, which uses `buffer`
internally, **which in turn requires this setup**.

Without this rollup configuration, you will receive the following
error from the svelte build process:

```
(!) Missing shims for Node.js built-ins
Creating a browser bundle that depends on 'buffer'.
You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins       
(!) Plugin node-resolve: preferring built-in module 'buffer' over local alternative at 
    'C:\dev\visualize-it\node_modules\buffer\index.js', pass 'preferBuiltins: false'
    to disable this behavior or 'preferBuiltins: true' to disable this warning
(!) Unresolved dependencies
https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency

buffer (imported by 
        node_modules\crc\crc1.js,
        node_modules\crc\crc8.js,
        node_modules\crc\crc16xmodem.js,
        node_modules\crc\crc16modbus.js,
        node_modules\crc\crc16.js,
        node_modules\crc\crc16ccitt.js,
        node_modules\crc\crc16kermit.js,
        node_modules\crc\crc24.js,
        node_modules\crc\crcjam.js,
        node_modules\crc\crc32.js,
        node_modules\crc\crc81wire.js,
        node_modules\crc\create_buffer.js)

(!) Missing global variable name
Use output.globals to specify browser global variable names corresponding to external modules
buffer (guessing 'buffer')
```

**Links**:
- [use node builtins in browser with rollup](https://openbase.io/js/rollup-plugin-node-builtins)
- [npm rollup-plugin-node-builtins](https://www.npmjs.com/package/rollup-plugin-node-builtins)
- [npm rollup-plugin-node-globals](https://www.npmjs.com/package/rollup-plugin-node-globals)


At the end of this process you should have:

- The ability to use npm packages that utilize node builtins _(such as
  `buffer`, used by `crc`)_.

- Impacted Dependencies:
  ```
  rollup-plugin-node-builtins
  rollup-plugin-node-globals
  ```

- Impacted Files:
  ```
  visualize-it/
    rollup.config.js ... modified to include Node Builtin configuration
  ```

**Installation Details**:

- Install required dependencies:
  ```
  $ npm install --save-dev rollup-plugin-node-builtins
    + rollup-plugin-node-builtins@2.1.2
      added 99 packages from 57 contributors and audited 267136 packages in 12.685s
      found 2 moderate severity vulnerabilities

  $ npm install --save-dev rollup-plugin-node-globals
    + rollup-plugin-node-globals@1.4.0
      added 5 packages from 79 contributors and audited 267145 packages in 9.376s
      found 2 moderate severity vulnerabilities
  ```


- Configure `rollup.config.js` _(in support of **Node Builtins**)_

  * For details, see embedded comments (`Node Builtins`) in `rollup.config.js`

  * **rollup.config.js** _sample_
    ```js
    // KJB: in support of: Node Builtins, used by some npm packages (e.g. crc/buffer), requiring built-in shim for modules designed for Browserfy
    import globals   from 'rollup-plugin-node-globals';
    import builtins  from 'rollup-plugin-node-builtins';

    export default {
      ...
      plugins: [
        ...
        // KJB: in support of: Node Builtins, used by some npm packages (e.g. crc/buffer), requiring built-in shim for modules designed for Browserfy
        globals(),
        builtins(),
      ]
    };
    ```


<!--- *** SUB-SECTION *************************************************************** --->
# Setup Jest Unit Testing

**visualize-it** uses [Jest](https://jestjs.io/en/) as it's unit
testing framework.  Svelte is **not** pre-configured with any testing
solution, so you must configure this yourself.


**Links**:
- [Jest](https://jestjs.io/en/)
- [Jest Installation](https://jestjs.io/docs/en/getting-started.html)
- [Testing Svelte components with Jest](https://dev.to/jpblancodb/testing-svelte-components-with-jest-53h3)
- [How to test Svelte components](https://timdeschryver.dev/blog/how-to-test-svelte-components)

At the end of this process you should have:

- The ability to use Jest in testing your JavaScript modules _(**not**
  GUI)_.

- Impacted Dependencies:
  ```
  @babel/core
  @babel/preset-env
  babel-jest
  jest
  ```

- Impacted Files:
  ```
  visualize-it/
    babel.config.js ...... babel configuration used by jest  [see: "Setup Jest Unit Testing")
    jest.config.js ....... jest unit testing configuration [see: "Setup Jest Unit Testing")
  ```

**Installation Details**:

**NOTE**: Jest requires babel, which not available in Svelte
          out-of-the-box, so you must install it manually.

**SideBar**: **visualize-it** does **not** systematically test the GUI
             itself, only business logic in JavaScript modules.  As a result, any
             UI related dependency found in the linked instructions were omitted.

- Install required dependencies (Jest and Babel):
  ```
  $ npm install --save-dev @babel/core @babel/preset-env jest babel-jest
    + jest@25.4.0
      added 620 packages from 281 contributors and audited 260964 packages in 36.954s
    + babel-jest@25.4.0
    + @babel/core@7.9.0
    + @babel/preset-env@7.9.5
      added 68 packages from 7 contributors and updated 2 packages in 21.756s
  ```

- Configure Jest/Babel by adding two files _(in project root)_:
  * **jest.config.js**:
    ```js
    // configuration of jest unit tests
    module.exports = {
      transform: {
        "^.+\\.js$": "babel-jest"
      },
      moduleFileExtensions: ["js"],
    
      // KJB: other UNNEEDED (I think)
      // testPathIgnorePatterns: ["node_modules"],
      // bail: false,
      // verbose: true,
      // transformIgnorePatterns: ["node_modules"],
    };
    ```
  * **babel.config.js**:
    ```js
    // babel needed for jest unit tests :-(
    // ... Svelte has it's own ES6 mechanism :-)
    module.exports = {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current"
            }
          }
        ]
      ]
    };
    ```

- Setup the **Testing NPM Scripts**:

  **babel.config.js**:
  ```js
  ... snip snip

  "scripts": {
    ...
    "test":       "jest src",
    "test:watch": "npm run test -- --watch"
  },

  ... snip snip
  ```


<!--- *** SUB-SECTION *************************************************************** --->
# Setup Documentation Tooling

AI: details to follow



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Deployment

**visualize-it** is deployed on github pages (both the web-app and our documentation).

AI: refine this when I actually do it (in visualize-it)

At the end of this process you should have:

- AI: itemize this when I actually do it

<!--- Comment out KJB Notes

**Deploy App VIA gh-pages** _(KJB Notes)_:

```
> REFERENCE: Create React App (Deployment)
  ... see: https://create-react-app.dev/docs/deployment/#github-pages-https-pagesgithubcom
> REFERENCE: CreateReactApp.txt
  ... see: CreateReactApp.txt (see: "deploy app VIA gh-pages")
           c:/data/tech/dev/ReactJS/notes/CreateReactApp.txt

> ********************************************************************************
- AI: retrofit this

      ********************************
      * SUMMARIZE DEPLOYMENT PROCESS * ... stale master in: CreateReactApp.txt
      ********************************

      > KEY: We are deploying BOTH docs and app on the same site

      * setup js.org sub-domain web alias (takes time to resolve)
        - for detailed steps see: "setup js.org" below 
        - FROM: https://kevinast.github.io/visualize-it
          TO:   https://visualize-it.js.org
        - you can actually do this at ANY TIME (first or last)
          BECAUSE: there is NO build dependency on the deployment domain
          EVERYTHING IS USING RELATIVE RESOURCES!!!

      > following steps assume the js.org sub-domain is in place
        ... but (again) you can actually do this first or last

      > GENERAL
      * site organization:
        /              ... root
          CNAME        ... the gh-pages custom domain
          index.html   ... a redirector to our docs
                           ex: FROM: https://visualize-it.js.org/
                               TO:   https://visualize-it.js.org/docs

          docs/        ... app documentation
            bla            FROM: {project}/_docs ... machine generated from {project}/docs (via gitbook)
            bla            ex:   https://visualize-it.js.org/docs

          app/         ... app deployment
            bla            FROM: {project}/build ... machine generated from {project}/ (via create-react-app)
            bla            ex:   https://visualize-it.js.org/app


      > GENERAL -and- DOCS-RELATED
      * setup deployment root
        - this is MANUALLY done ONE TIME
          ... using temporary local dirs
          ... mastered in gh-pages only
          ... should never change
              ... if (for some reason) a change is needed
                  you can edit via github web on gh-pages branch

        - define temporary local files
          {project}/
            _docs/
              CNAME
              =====
              visualize-it.js.org

              index.html  ... redirector to docs
              ==========
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="refresh" content="1; url=./docs">
                  <script>
                    window.location.href = "./docs"
                  </script>
                  <title>visualize-it docs redirect</title>
                </head>
                <body>
                  <h1>visualize-it docs redirect</h1>
                  <p>
                    If you are not redirected automatically, follow this link to the
                    <a href="./docs">visualize-it docs</a>
                  </p>
                </body>
              </html>

              docs/
                index.html ... temporary file JUST to see it work (will be replaced with gitbook soon)

        - publish docs to gh-pages MANUALLY
          $ npx gh-pages --dist _docs

        - WORKS: test redirection to docs
          https://visualize-it.js.org/

        - you can now discard {project}/_docs
          ... should never change
              ... if (for some reason) a change is needed
                  you can edit via github web on gh-pages branch
          ... and the sub-dirs are published from other sources


      > GENERAL
      > DOCS-RELATED
      > APP-RELATED
      * setup the deployment scripts (in package.json)
        - TERMINOLOGY:
          "terminology:COMMENT":   "app is DEPLOYED, and docs are PUBLISHED",
        - DEPLOY APP (NOTE: see CRA for setup required to deploy to a sub-directory ... there is a bit of config)
          "preapp:deploy":         "npm run app:build",
KEY       "app:deploy":            "gh-pages --dist build --dest app"
        - PUBLISH DOCS
          "l8tr:docs:prepare:do:once":  "gitbook install",
          "l8tr:docs:build:COMMENT":    "NOTE: for gitbook build/serve, following diagnostics are useful: --log=debug --debug",
          "l8tr:docs:build":            "gitbook build",
          "l8tr:docs:serve":            "gitbook serve",
          "l8tr:predocs:publish":       "npm run docs:build",
KEY       "docs:publish":          "gh-pages --dist _docs --dest docs",
          "docs:gitbook:help":     "gitbook help",

      > DOCS-RELATED
      * change {project}/_docs to something different -and- test script: docs:publish
        - NOTE: just reposition the docs root down and modify
        - NOTE: this will eventually be machine generated
        - run script
          $ npm run docs:publish
        - WORKED: verify root has NOT changed
        - WORKED: verify root/docs HAS changed

      > APP-RELATED
      * setup app deployment

        > BACKGROUND:
          - KEY: important concept: we are deploying our app in a sub-directory of our server
                 ... this is a bit different than we have done before
                 ... sidebar: and we are deploying our docs in a different sub-directory
          - CRA has a new option that makes it EASY to deploy apps in a sub-directory of our server
            * we can simply plop our app into ANY dir
            * KEY: for us, this is a viable option BECAUSE we are NOT using the:
                   - HTML5 pushState history API
                   - or not using client-side routing (KJB: they mean routing with history)
            * SUMMARY: this is accomplished by:
DO THIS       - using the following "homepage" in our package.json
                  package.json
                  ============
                  "homepage": ".", ... CRA makes all asset paths relative to index.html
DO THIS       - AND making all our run-time resource retrievals RELATIVE (no starting slash)
                ... this is the resources found in {project}/public
                ... ex: 
                        * KonvaSandboxScreen.js
                          <img src="visualize-it-logo.png" width="300" alt="Logo" className={classes.entry} /> ... NOT: /visualize-it-logo.png
                        * initializeFirebase.js
                          const resp = await fetch('fbac'); ... NOT: '/fbac'
          
              - BOTTOM LINE:
KEY: GREAT      * by using this deployment technique (package.json directive of "homepage": ".")
                  AND employing relative resource paths (in fetch() and <img/> etc)
                      NOTE: I did in fact test absolute paths
                            > these absolute paths WORK in dev, but BREAK in production (when deployed to a sub-dir)
                            > ... SO the relative paths are a required technique
KEY: GREAT        - we can deploy the app to ANY sub-directory
                    * in addition BECAUSE we are NOT using:
                      * HTML5 pushState history API
                      * or not using client-side routing (KJB: they mean routing with history)
KEY: GREAT        - we can use same heuristic for dev and prod deployment


        - DO THIS:
          * apply the "DO THIS" (above)
          * test app
            - in dev
              $ npm run app:start
                ... http://localhost:3000/
            - in prod
              $ npm run app:deploy
                ... https://visualize-it.js.org/app/

      > GENERAL
      * check in / sync
        ... finalize app deployment process (supporting BOTH docs and app on the same site)

      > GENERAL
      * once app is deployed in production,
        - setup shortcut to run as an app (not in browser)
          * this chrome procedure has changed (since last chrome version)
            > YES: this is what we want
              - create a shortcut -AND- check the "Open as window"
                ... THIS DOES IT ALL!!!
            > NO:  this is a bit quirky
              - create a shortcut
              - manually alter the properties target, adding the following option AT THE END (delimited with space)
                  -app=http://localhost:3000/
              - works pretty well, but is missing some ... hamburger menu

        - bookmark app
          

      ****************
      * setup js.org * ... can be done FIRST OR LAST
      ****************

      * I am going to be deploying BOTH app and docs to gh-pages

        - prime the pump by putting a dummy page in the root:

          * crete _docs directory where our machine generated gitbook will eventually be places
            - .gitignore it
              # machine generated docs (from GitBook)
              /_book/
              /_docs/

          * add following temporary html file to this _docs 
            _docs/index.html <<< NOTE: has to be "reasonable content"
            ================ <<< NOTE: we can just deploy our app for this too (now that it can be plopped anywhere)
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>visualize-it</title>
              </head>
              <body>
                <h1>visualize-it</h1>
            
                <p>
                  <b>visualize-it</b> promotes an interactive graphical
                  visualization of an external system!
                </p>
                  <img src="./visualize-it-logo.png"  width="250" alt="Logo"/>
                <p>
                  This is your view into External Systems!
                </p>
                  <img src="./visualize-it-logo-eyes.jpg" width="500" alt="Logo Eyes"/>
            
                <p>
                  This is currently work-in-progress and will be used to
                  cross-communicate to co-workers on the project.
                </p>
            
                <p>
                  Please take a look at the initial <a href="https://github.com/KevinAst/visualize-it/blob/initial-tooling/docs/visualize-it.md">Design Docs</a>.
                </p>
            
              </body>
            </html>

          * deploy file to gh-pages
            $ npx gh-pages --dist _docs

          * test site
            ... https://KevinAst.github.io/visualize-it

        - setup the js.org sub-domain alias: https://visualize-it.js.org/
          ... see: c:/data/tech/dev/GitHub.txt (configure the js.org subdomain) ... prob a bit stale
          * KEY:  js.org offers sub-domain that points to GitHub Pages
          * NICE: https://visualize-it.js.org/
                  https://kevinast.github.io/visualize-it

          * setup CNAME file at root and deploy to gh-pages
              CNAME
              =====
              visualize-it.js.org

             - issue a PR that adds my sub-domain to js.org
               * all done from the web
               * IF NEED BE (in lue of syncing old repo - which is a major deal), simply delete your copy of an old dns.js.org fork
                 - from your github dns.js.org fork
                 - click settings
                 - at bottom click delete repository
               * from the github js-org/dns.js.org project
                 ... https://github.com/js-org/js.org     <<< FYI: used to be dns.js.org
               * click the FORK button
                 ... this adds the dns.js.org to MY github
                 ... https://github.com/KevinAst/js.org    <<< FYI: used to be dns.js.org
                   * via the web, edit the cnames_active.js file
                   * add your entry:
                         "visualize-it": "kevinast.github.io/visualize-it",
                   * commit:
                     ... adding visualize-it sub-domain
                   * issue New Pull Request
                   * back in the dns.js.org, monitor your Pull Request
                     ... https://github.com/js-org/js.org/pulls
                         https://github.com/js-org/js.org/pull/3516
                     ... should take effect within 24 hrs
                     - confirm: web site NO LONGER SERVES till they enact this
                       https://kevinast.github.io/visualize-it/
                     - wait for sub-domain to go live
                       * GEEZE: they rejected this because it doesn't have reasonable content
                         ... https://github.com/js-org/js.org/wiki/No-Content
                         - add my README page
                         - publish
                           $ npx gh-pages --dist _docs
                         - add note to pull request
                           . I have added some minimal content to the page :-)
                           . Please note that this is an active project, where the page will be used to both:
                              - deploy a single-page-app
                              - and define documentation 
                             in order to collaborate to other team members.
                           . Thank you for your service.
                           . Kevin
                       * ONCE MERGED 
                       * WORKS: should be able to now see the url:
                         ... https://visualize-it.js.org/

KJB Notes --->





<!--- *** LINKS ***************************************************************** --->

[NPM Scripts]:                    #npm-scripts
[Dependencies]:                   #dependencies
[Project Resources]:              #project-resources
[Project Setup]:                  #project-setup
  [Setup GitHub Project]:         #setup-github-project
  [Setup Svelte Tooling]:         #setup-svelte-tooling
  [Setup UI Kit (SMUI)]:          #setup-ui-kit-smui
  [Setup Absolute Imports]:       #setup-absolute-imports
  [Setup Node Builtins]:          #setup-node-builtins
  [Setup Jest Unit Testing]:      #setup-jest-unit-testing
  [Setup Documentation Tooling]:  #setup-documentation-tooling
  [Setup Deployment]:             #setup-deployment
