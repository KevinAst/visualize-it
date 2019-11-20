import {supplementActivateTab}  from '../logic'; // modules under test
import _tabManager              from '../featureName';
import _tabManagerAct           from '../actions';

describe('TabManager logic', () => {


  //********************************************************************************
  //********************************************************************************
  //********************************************************************************
  describe('supplementActivateTab logic', () => {

    // NOTE1: on the state.tabs:
    //        ... the only thing we care about is a potential entry that matches target tabId

    // NOTE2: Test descriptions ENUMERATE ALL (via template):
    //                       REQ                          STATE                STATE               DIRECTIVE
    //         >> activate a "permanent/preview" tab THAT EXISTS/NON_EXISTS as "permanent/preview" DISPLACING/RETAINING prior preview tab -or- WITH NO prior preview tab
    // 
    //         1. activate a "permanent"         tab THAT NON_EXISTS                               RETAINING prior preview tab
    //         2. activate a "permanent"         tab THAT NON_EXISTS                               WITH NO prior preview tab
    //         3. activate a "permanent"         tab THAT EXISTS            as "permanent"         RETAINING prior preview tab
    //         4. activate a "permanent"         tab THAT EXISTS            as "permanent"         WITH NO prior preview tab
    //         5. activate a "permanent"         tab THAT EXISTS            as "preview"           WITH PREVIEW changed to permanent
    //         X. activate a "permanent"         tab THAT EXISTS            as "preview"           WITH NO prior preview tab        <<< NOT-POSSIBLE (there has to be a preview tab, because it exists as preview)
    // 
    //        11. activate a "preview"           tab THAT NON_EXISTS                               DISPLACING prior preview tab
    //        12. activate a "preview"           tab THAT NON_EXISTS                               WITH NO prior preview tab
    //        13. activate a "preview"           tab THAT EXISTS            as "permanent"         RETAINING prior preview tab
    //        14. activate a "preview"           tab THAT EXISTS            as "permanent"         WITH NO prior preview tab
    //        15. activate a "preview"           tab THAT EXISTS            as "preview"           WITH NO CHANGE to preview tab
    //        XX. activate a "preview"           tab THAT EXISTS            as "preview"           WITH NO prior preview tab        <<< NOT-POSSIBLE (there has to be a preview tab, because it exists as preview)

    doTest({
      desc: '1. activate a "permanent"         tab THAT NON_EXISTS                                 RETAINING prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   false,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab9',
        tabs: [ // see NOTE1
//        {tabId: 'xx', explain: 'xx'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab9',
        removeTabId:  null,
        addNewTab:    true,
      },
    });

    doTest({
      desc: '2. activate a "permanent"         tab THAT NON_EXISTS                                 WITH NO prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   false,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: null,
        tabs: [ // see NOTE1
                //        {tabId: 'xx', explain: 'xx'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: null,
        removeTabId:  null,
        addNewTab:    true,
      },
    });

    doTest({
      desc: '3. activate a "permanent"         tab THAT EXISTS            as "permanent"         RETAINING prior preview tab',

      req: {
        tabId:     'tab1',
        preview:   false,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab9',
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab9',
        removeTabId:  null,
        addNewTab:    false,
      },
    });

    doTest({
      desc: '4. activate a "permanent"         tab THAT EXISTS            as "permanent"         WITH NO prior preview tab',

      req: {
        tabId:     'tab1',
        preview:   false,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: null,
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: null,
        removeTabId:  null,
        addNewTab:    false,
      },
    });

    doTest({
      desc: '5. activate a "permanent"         tab THAT EXISTS            as "preview"         WITH PREVIEW changed to permanent',

      req: {
        tabId:     'tab1',
        preview:   false,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab1',
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: null,
        removeTabId:  null,
        addNewTab:    false,
      },
    });

    doTest({
      desc: '11. activate a "preview"           tab THAT NON_EXISTS                               DISPLACING prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   true,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab9',
        tabs: [ // see NOTE1
//        {tabId: 'xx', explain: 'xx'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab1',
        removeTabId:  'tab9',
        addNewTab:    true,
      },
    });

    doTest({
      desc: '12. activate a "preview"           tab THAT NON_EXISTS                               WITH NO prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   true,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: null,
        tabs: [ // see NOTE1
//        {tabId: 'xx', explain: 'xx'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab1',
        removeTabId:  null,
        addNewTab:    true,
      },
    });

    doTest({
      desc: '13. activate a "preview"           tab THAT EXISTS            as "permanent"         RETAINING prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   true,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab9',
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab9',
        removeTabId:  null,
        addNewTab:    false,
      },
    });

    doTest({
      desc: '14. activate a "preview"           tab THAT EXISTS            as "permanent"         WITH NO prior preview tab',
      req: {
        tabId:     'tab1',
        preview:   true,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: null,
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: null,
        removeTabId:  null,
        addNewTab:    false,
      },
    });

    doTest({
      desc: '15. activate a "preview"           tab THAT EXISTS            as "preview"           WITH NO CHANGE to preview tab',
      req: {
        tabId:     'tab1',
        preview:   true,
      },
      state: {
        activeTabId:  'tab8',
        previewTabId: 'tab1',
        tabs: [ // see NOTE1
          {tabId: 'tab1', explain: 'EXISTS'}
        ],
      },
      expected: {
        activeTabId:  'tab1',
        previewTabId: 'tab1',
        removeTabId:  null,
        addNewTab:    false,
      },
    });


    function doTest({desc, req, state, expected}) {

      // console.log('xx desc:     ', desc);
      // console.log('xx req:      ', req);
      // console.log('xx state:    ', state);
      // console.log('xx expected: ', expected);

      describe(desc, () => {

        // simulate our current redux state
        const getState = () => ({
          [_tabManager]: state
        });

        // define the desired action
        const action = _tabManagerAct.activateTab(req.tabId, req.preview);

        // simulate the redux-logic next(action) function
        let   nextAction = undefined;
        const next = (action) => nextAction = action;

        // invoke our module under test
        supplementActivateTab.transform({getState, action}, next);

        // console.log('xx after invoking test module, nextAction: ', nextAction);

        // test expected directives, injected in action
        test('next(action) has been called',      () => expect(nextAction).toBeDefined());

        test('tabName in action ',                () => expect(nextAction.tabName).toEqual('UNKNOWN')); // this test does NOT register anything to the Tab Registry

        test('pgmDirectives injected in action ', () => expect(nextAction.pgmDirectives).toBeDefined());
        test('pgmDirectives.next_activeTabId',    () => expect(nextAction.pgmDirectives.next_activeTabId)  .toEqual(expected.activeTabId));
        test('pgmDirectives.next_previewTabId',   () => expect(nextAction.pgmDirectives.next_previewTabId) .toEqual(expected.previewTabId));
        test('pgmDirectives.removeTabId',         () => expect(nextAction.pgmDirectives.removeTabId)       .toEqual(expected.removeTabId));
        test('pgmDirectives.addNewTab',           () => expect(nextAction.pgmDirectives.addNewTab)         .toEqual(expected.addNewTab));

      });
    }
  });

});
