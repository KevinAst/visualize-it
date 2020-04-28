# Tooling

This document contains resources to help you in both the development
and tooling of the **visualize-it** project.


# At a Glance

- [NPM Scripts]
- [Dependencies]




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

Dependency                | Type        | Usage                  | Refer To
------------------------- | ----------- | ---------------------  | ----------------
`@babel/core`             | **TOOLING** | Jest Testing           | [xyz]
`@rollup/plugin-commonjs` | **TOOLING** | Svelte Setup/Template  | [xyz]
`rollup`                  | **TOOLING** | Svelte Bundler         | [xyz]
`crc`                     | **APP**     | CRC Hashing Utility    | _application code_ (`src/util/crc.js`)
`svelte-material-ui`      | **APP**<br>**TOOLING** | UI Kit used by App     | _application code (various)_<br>[Configure UI Kit]

?? pull in ALL devDependencies





<!--- *** SECTION *************************************************************** --->
# Configure UI Kit

?? TEST TEST TEST



<!--- *** LINKS ***************************************************************** --->

[NPM Scripts]:           #npm-scripts
[Dependencies]:          #dependencies

  [Configure UI Kit]:      #configure-ui-kit
