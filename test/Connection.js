/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {retrieve, enterTextField, given, when, click, assertMessage, loadPage, assertMissing} = testutils;

describe('connection page', function () {
    it('should connect', function () {
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                "/auth/connect": {code: 200, content: {ack: "OK", user: {}}},
                "/formations": {code: 200, content: {myCollection: []}}
            });
        })
        when(()=>{
            enterTextField(root, "login", "admin@test.com");
            enterTextField(root, "password", "password");
            click(root, "connectionButton");
        }).then(()=>{
            assertMissing(root, "msgFieldError");
        });
    })

    it('should not connect (empty fields)', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection");
        });
        when(()=>{
            click(root, "connectionButton");
        }).then(()=>{
            assertMessage(root, "msgFieldError", "Veuillez remplir correctement tous les champs");
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
            assertMessage(root, "msgFieldError", "Veuillez remplir correctement tous les champs");
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
            assertMessage(root, "msgFieldError", "Veuillez remplir correctement tous les champs");
        })
    });
})