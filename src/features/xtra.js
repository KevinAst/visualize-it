import changeManager           from './common/changeManager/changeManager';
import leftNavManager          from './common/baseUI/LeftNavManager';
import LeftNavMenuPallet       from './common/baseUI/comp/LeftNavMenuPallet';
import LeftNavCollapsibleItem  from './common/baseUI/comp/LeftNavCollapsibleItem';
import tabRegistry             from './common/tabManager/tabRegistry';
import TabControllerScene      from './common/tabManager/TabControllerScene';
import TabControllerCollage    from './common/tabManager/TabControllerCollage';
import TabControllerCompRef    from './common/tabManager/TabControllerCompRef';

//*** 
//*** Promote feature public assets
//*** ... aliased to minimize feature coupling
//*** 

export {
  changeManager,

  leftNavManager,
  LeftNavMenuPallet,
  LeftNavCollapsibleItem,

  tabRegistry,
  TabControllerScene,
  TabControllerCollage,
  TabControllerCompRef,
};
