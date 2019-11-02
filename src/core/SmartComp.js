// SmartComp: an abstract base class of all visualize-it components
//         KEY: the fundamental aspect of a component is it binds to a data model (for visual affects and animation)
export default class SmartComp {
  constructor(id) {
    this.id = id;
  }

  manifest(container) { // container: Layer/Group
    throw new Error(`***ERROR*** SmartComp pseudo-interface-violation: ${this.constructor.name}.manifest() is a required method that MUST BE implemented!`);
  }

}
