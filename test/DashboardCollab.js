/**
 * Created by TBE3610 on 22/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, click, assertMessage, assertMissing} = testutils;

describe('dashboard collab', function(){
    it('should display undone formation', function(){
        let {root, state} = given(()=> {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {myCollection: [
                        {_id: "1", label: "formation undone", levelsTab: [{gamesTab: [{questions: [{}], answered: []}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', mockResponses, user);
        })
        when(()=>{
            assertMessage(root, "textMiniature1", "formation undone");
            assertMessage(root, "textMiniature2", "formation done");
            click(root, "unDoneIcon");
        }).then(()=>{
            assertMessage(root, "textMiniature1", "formation undone");
            assertMissing(root, "textMiniature2");
        })
    });
    it('should display pending formation', function(){
        let {root, state} = given(()=> {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {myCollection: [
                        {_id: "1", label: "formation inProgress", levelsTab: [{gamesTab: [{questions: [{}, {}], answered: [{}]}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', mockResponses, user);
        })
        when(()=>{
            assertMessage(root, "textMiniature1", "formation inProgress");
            assertMessage(root, "textMiniature2", "formation done");
            click(root, "inProgressIcon");
        }).then(()=>{
            assertMessage(root, "textMiniature1", "formation inProgress");
            assertMissing(root, "textMiniature2");
        })
    });
    it('should display done formation', function(){
        let {root, state} = given(()=> {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {myCollection: [
                        {_id: "1", label: "formation inProgress", levelsTab: [{gamesTab: [{questions: [{}, {}], answered: [{}]}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', mockResponses, user);
        })
        when(()=>{
            assertMessage(root, "textMiniature1", "formation inProgress");
            assertMessage(root, "textMiniature2", "formation done");
            click(root, "doneIcon");
        }).then(()=>{
            assertMissing(root, "textMiniature1");
            assertMessage(root, "textMiniature2", "formation done");
        })
    });
    it('should enter a formation');
})