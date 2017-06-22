/**
 * Created by TBE3610 on 22/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, click, clickElement, assertMessage, assertPresent, assertMissing, mouseEnterElement} = testutils;

describe('dashboard collab', function(){
    it('should display undone formation', function(){
        let {root, state} = given(() => {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {
                        myCollection: [
                            {
                                _id: "1",
                                label: "formation undone",
                                levelsTab: [{gamesTab: [{type: 'Quiz', questions: [{}], answered: []}]}]
                            },
                            {_id: "2", label: "formation done"}
                        ]
                    }
                },
                "/users/notes": {
                    content: {
                        note: "5",
                        _id: "1",
                        userId: "1",
                        versionId: "1",
                        formationId: "1"
                    }
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
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
                        {_id: "1", label: "formation inProgress", levelsTab: [{gamesTab: [{type: 'Quiz',questions: [{}, {}], answered: [{}]}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                },
                "/users/notes": {
                    content: {
                        note: "5",
                        _id: "1",
                        userId: "1",
                        versionId: "1",
                        formationId: "1"
                    }
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
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
                        {_id: "1", label: "formation inProgress", levelsTab: [{gamesTab: [{type: 'Quiz', questions: [{}, {}], answered: [{}]}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                },
                "/users/notes": {
                    content: {
                        note: "5",
                        _id: "1",
                        userId: "1",
                        versionId: "1",
                        formationId: "1"
                    }
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
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
    it('should display popout when hover star', function(){
        let {root, state} = given(()=> {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {myCollection: [
                        {_id: "2", label: "f"}
                    ]}
                },
                "/users/notes": {
                    content: {
                        note: "5",
                        _id: "2",
                        userId: "1",
                        versionId: "1",
                        formationId: "1"
                    }
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
        })
        when(() => {
            mouseEnterElement(root, "star1");
        }).then(() => {
            assertPresent(root, "fStarMiniatures");
        })
    })
    it('should enter a formation and return to Dashboard', function(){
        let {root, state, runtime} = given(()=> {
            let mockResponses = {
                "/formations": {
                    code: 200,
                    content: {myCollection: [
                        {_id: "1", label: "formation inProgress", levelsTab: [{gamesTab: [{type: 'Quiz', questions: [{}, {}], answered: [{}]}]}]},
                        {_id: "2", label: "formation done"}
                    ]}
                },
                "/users/notes": {
                    content: {
                        note: "5",
                        _id: "1",
                        userId: "1",
                        versionId: "1",
                        formationId: "1"
                    }
                }
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
        });

        when(() => {
            click(root, "textMiniature1");
            assertMessage(root, "headerMessage", "formation inProgress");
            click(root, "return");
        }).then(() => {
            assertMessage(root, "headerMessage", "Dashboard");
        });
    });


    it('should load lastAction');
})