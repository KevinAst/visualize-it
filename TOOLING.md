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
  - [Setup Jest Unit Testing]
  - [Setup Documentation Tooling]
  - [Setup Deployment]

<!--- *** SECTION *************************************************************** --->
# NPM Scripts

This section provides a summary of the available **NPM Scripts**
_(organized by task)_:


?? RETROFIT THIS!!!!

```
DEVELOPMENT
===========
start .......... convenient alias to app:serve

app:serve ...... launch dev server, continuously watching for code changes

docs:serve ..... L8TR: launch documentation server, continuously watching for docs changes


TESTING
=======
app:test ....... run test suite, continuously watching for module changes


CODE QUALITY
============
app:lint ....... verify code quality, linting BOTH production and test code
                 NOTE: Real-time linting is ALSO available in the VSCode editor.

app:check ...... L8TR: convenience script to:
                 - verify code quality (lint)
                 - show outdated installed packages
                 - run tests (against our master src)

pkgReview ...... L8TR: show outdated installed packages


DEPLOYMENT       NOTE: we DEPLOY the application
==========
app:deploy ..... deploy latest application to https://visualize-it.js.org/app/
                 NOTE: this script FIRST builds the app from scratch
                       ... via preapp:deploy

                 >>> OPTIONALLY:
app:build ...... you can manually build the app (into the build/ dir)
                 HOWEVER it is not typically necessary 
                 BECAUSE this build is executed as the first step in app:deploy

app:clean ...... L8TR: clean all machine-generated app/build directories


PUBLISH          NOTE: we PUBLISH the documentation
=======
docs:publish ... publish the latest documentation to https://visualize-it.js.org/docs/
                 NOTE: this script FIRST builds the docs from scratch
                       ... via predocs:publish

                 >>> OPTIONALLY:
docs:build   ... L8TR: you can manually build the docs (into the _book/ dir)
                 HOWEVER it is not typically necessary 
                 BECAUSE this build is executed as the first step in docs:publish

docs:clean   ... L8TR: clean all machine-generated docs directories


MISC
====
clean .......... L8TR: cleans ALL machine-generated directories
```





<!--- *** SECTION *************************************************************** --->
# Dependencies

This section provides some insight regarding the various dependencies
found in **visualize-it**.

The dependency list can become quite large for a mature project.  In
looking at `package.json`, the inevitable questions are:

- what is this dependency
- why is it needed
- is it a dependency for project tooling or application code?

This last bullet is especially poignant because all Svelte project
dependencies are `devDependencies`, due to the fact that all run-time
resources are bundled together by the Svelte compiler.

?? finish this (pulling in ALL devDependencies), once we have all the "Refer To" sections

Dependency                | Type        | Usage                  | Refer To
------------------------- | ----------- | ---------------------  | ----------------
`@babel/core`             | **TOOLING** | Jest Testing           | [xyz]
`@rollup/plugin-commonjs` | **TOOLING** | Svelte Setup/Template  | [xyz]
`rollup`                  | **TOOLING** | Svelte Bundler         | [xyz]
`crc`                     | **APP**     | CRC Hashing Utility    | _application code_ (`src/util/crc.js`)
`svelte-material-ui`      | **APP**<br>**TOOLING** | UI Kit used by App     | _application code (various)_<br>[Setup UI Kit (SMUI)]



<!--- *** SECTION *************************************************************** --->
# Project Resources

Wondering what some of the top-level file resources are?  Here is a
summary:

?? FINISH THIS once we have all the "Refer To" sections

```
visualize-it/
  .git/ ................ our local git version control repo (duh)
  .gitignore ........... files/dirs to exclude from version control (ex: machine generated)
  _docs/ ............... machine generated doc resources (see: ??)
  babel.config.js ...... xx
  docs/ ................ master source of our on-line docs (see: ??)
  jest.config.js ....... xx
  LICENSE.md ........... xx
  node_modules/ ........ xx
  package.json ......... xx
  package-lock.json .... xx
  public/ .............. xx
  README.md ............ xx
  rollup.config.js ..... xx
  src/ ................. the app source code ... duh
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


<!--- *** SUB-SECTION *************************************************************** --->
# Setup GitHub Project

There are many ways of initiating a new GitHub project ... I'll leave
the details to you :-)



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Svelte Tooling

This task assumes you are "starting from scratch", setting up the
Svelte tooling _(the compiler, etc.)_, with the basic application code
template.

?? pull in notes from visualize-it-svelte.txt



<!--- *** SUB-SECTION *************************************************************** --->
# Setup UI Kit (SMUI)

?? pull in notes from visualize-it-svelte.txt
- ? install sass package
- ? install rollup-plugin-postcss
- ? update rollup.config.js



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Jest Unit Testing

Svelte V3 does not ship with any Unit Test capability.  I am using Jest.
   
?? pull in details from journal.txt



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Documentation Tooling

AI: details to follow



<!--- *** SUB-SECTION *************************************************************** --->
# Setup Deployment

**visualize-it** is deployed on github pages (both the web-app and our documentation).

AI: details to follow






<!--- *** LINKS ***************************************************************** --->

[NPM Scripts]:                    #npm-scripts
[Dependencies]:                   #dependencies
[Project Resources]:              #project-resources
[Project Setup]:                  #project-setup
  [Setup GitHub Project]:         #setup-github-project
  [Setup Svelte Tooling]:         #setup-svelte-tooling
  [Setup UI Kit (SMUI)]:          #setup-ui-kit-smui
  [Setup Jest Unit Testing]:      #setup-jest-unit-testing
  [Setup Documentation Tooling]:  #setup-documentation-tooling
  [Setup Deployment]:             #setup-deployment
