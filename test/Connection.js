/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {retrieve, enterTextField, given, when, click, assertMessage, loadPage, assertMissing} = testutils;

describe('connection page', function () {
    it('should load cookie', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses: {
                    "/auth/verify":{content: {"ack": "OK", user:{admin:true}}},
                    "/formations": {code: 200, content: {myCollection: []}},
                    "/users/notes": {content: {}}
                }
            });
        })
        when(()=>{
            state.tryLoadCookieForPresenter()
        }).then(()=>{
            assertMessage(root, 'headerMessage', 'Dashboard')
        });
    })
    it('should resize', function(){
        let {runtime} = given(()=>{
            return loadPage("Connection");
        })
        when(()=>{
            runtime.globalEvent('resize');
        }).then(()=>{

        });
    })
    it('should connect', function () {
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses: {
                    "/auth/connect": {code: 200, content: {ack: "OK", user: {}}},
                    "/formations": {code: 200, content: {myCollection: []}},
                    "/users/notes": {content: {}}
                }
            });
        })
        when(()=>{
            enterTextField(root, "login", "admin@test.com");
            enterTextField(root, "password", "password");
            click(root, "connectionButton");
        }).then(()=>{
            assertMissing(root, "popUpMessage");
        });
    })

    it('should not connect (empty fields)', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection");
        });
        when(()=>{
            click(root, "connectionButton");
        }).then(()=>{
            assertMessage(root, "popUpMessage", "Veuillez remplir correctement tous les champs");
        });
    });

    it('should not connect (wrong login)', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection");
        })
        when(()=>{
            enterTextField(root, "login", "aaaa");
            enterTextField(root, "password", "azertyuiop");
            click(root, "connectionButton");
        }).then(()=>{
            assertMessage(root, "popUpMessage", "Veuillez remplir correctement tous les champs");
        })
    });

    it('should not connect (wrong password)', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection");
        })
        when(()=>{
            enterTextField(root, "login", "user@test.com");
            enterTextField(root, "password", "aa");
            click(root, "connectionButton");
        }).then(()=>{
            assertMessage(root, "popUpMessage", "Veuillez remplir correctement tous les champs");
        })
    });

    it('should find new focused field, ', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage("Connection")
        })
        when(()=>{
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:9, shiftKey:true, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:13, preventDefault:()=>{}});
        }).then(()=>{
            let focus = retrieve(root, '[loginselectedInput]');
            assert(focus);
        });

    });

    it('should disconnect', function () {
        let {root, state} = given(()=> {
            let mockResponses = {
                "/formations": {code: 200, content: {myCollection: []}},
                "/users/notes": {content: {}}
            };
            let user = {admin: false};
            return loadPage('Dashboard', {mockResponses, data:user});
        });

        when(()=>{
            click(root, "deconnection");
        }).then(()=>{
            assertMessage(root, "headerMessage", "CONNEXION");
        });
    });


    it('should load RegisterV and return to ConnectionV', function () {
        let {root, state} = given(()=>{
            return loadPage("Connection")
        })
        when(()=>{
            click(root, "createAccount");
            assertMessage(root, "headerMessage", "Inscription");
            click(root, "connexionText");
        }).then(()=>{
            assertMessage(root, "headerMessage", "Connexion");
        });
    });

});