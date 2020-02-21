import React          from 'react';
import ReactSmartView from 'util/ReactSmartView';

import TabController  from './TabController';

import verify         from 'util/verify';

import DispMode       from 'core/DispMode';
import Scene          from 'core/Scene';
import SmartView      from 'core/SmartView';


/**
 * TabControllerScene is a concrete class that manages a specific Scene tab.
 */
export default class TabControllerScene extends TabController {

  /**
   * Create a TabControllerScene.
   *
   * @param {string} tabId - the globally unique key, identifying the
   * tab in question. Typically a federated namespace is employed to
   * insure this key is globally unique (ex: compLibName/comp, or
   * systemName/view, etc.).
   *
   * @param {string} tabName the human interpretable name displayed in
   * the tab.
   *
   * @param {Scene} scene the scene being displayed/managed by this tab.
   */
  constructor(tabId, tabName, scene) {
    super(tabId, tabName);

    // validate parameters
    const check = verify.prefix(`${this.diagClassName()}() constructor parameter violation: `);
    // ... tabId/tabName done by base class
    // ... scene
    check(scene,                   'scene is required');
    check(scene instanceof Scene,  'scene must be a Scene object');

    // retain state specific to this derivation
    this.scene = scene;
  }

  // scene's are editable
  isEditable() {
    return true;
  }

  // manage DispMode settings (specific to scene)
  setDispMode(dispMode) {
    super.setDispMode(dispMode);

    //***
    //*** value added logic:
    //***

    // propagate setting into our object model
    if (dispMode === DispMode.edit) {
    }
    else if (dispMode === DispMode.view) {
    }
    else { // animate
    }
    // ?? do something ... within Scene API, pattern after: 
    //    ... src\features\sandbox\konvaSandbox\konvaSandboxSmartPkg.js
    //          sceneView1.draggableScene( !sceneView1.draggableScene() );
    //          log(`draggableScene() 1 reset to: ${sceneView1.draggableScene()}`);
    //    ... I THINK THIS IS NOW
    //        scene.draggable(draggable)

  }

  // wrap our scene in the panel display
  createTabPanelComp() {
    const view = new SmartView({id: `view-${this.getTabId()}`, name: `view-${this.getTabName()}`, scene: this.scene});
    const comp = () => <ReactSmartView view={view}/>;
    return comp;
  }

}
