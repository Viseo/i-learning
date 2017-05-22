/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    main = require('../src/main').main,
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
        let mockResponses = {};
        let {root, state} = main(mockResponses);
        state.loadPresenterConnection();

        enterTextField(root, "login", "aaaa");
        enterTextField(root, "password", "azertyuiop");

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage.text, testutils.escape("Veuillez remplir correctement tous les champs"));
    });

    it('should not connect (wrong password)', function(){
        let mockResponses = {}
        let {root, state} = main(mockResponses);
        state.loadPresenterConnection();

        enterTextField(root, "login", "admin@test.com");
        enterTextField(root, "password", "aa");

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage.text, testutils.escape("Veuillez remplir correctement tous les champs"));
    });
})