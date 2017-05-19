/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    main = require('./MainMock').mainMock,
    testutils = require('../lib/testutils'),
    {retrieve, rejectedPromise, resolvedPromise, enterTextField} = testutils;

var FModelMock = function (globalVariables) {
    class State {
        constructor() {}

        createRejectedPromise(message){
            return rejectedPromise(message);
        }

        loadPresenterConnection() {
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.ConnectionP(this);
            this.currentPresenter.displayView();
        }
    }

    return {State};
}

describe('connection page', function () {
    it('should connect', function () {
        let loginTest = "admin@test.com";
        let pwdTest = "password";
        let {root, state} = main(FModelMock);
        state.tryConnectForPresenterDashboard = (login, pwd, stayConnected) => {
            assert.equal(login, loginTest)
            assert.equal(pwd, pwdTest);
            assert.equal(stayConnected, true);
            return resolvedPromise();
        }
        state.loadPresenterConnection();

        enterTextField(root, "login", loginTest);
        enterTextField(root, "password", pwdTest);

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage, undefined);
    })

    it('should not connect (empty fields)', function(){
        let {root, state} = main(FModelMock);
        state.loadPresenterConnection();

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage.text, testutils.escape("Veuillez remplir correctement tous les champs"));


    });

    it('should not connect (wrong login)', function(){
        let {root, state} = main(FModelMock);
        state.loadPresenterConnection();

        enterTextField(root, "login", "aaaa");
        enterTextField(root, "password", "azertyuiop");

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage.text, testutils.escape("Veuillez remplir correctement tous les champs"));
    });

    it('should not connect (wrong password)', function(){
        let {root, state} = main(FModelMock);
        state.loadPresenterConnection();

        enterTextField(root, "login", "admin@test.com");
        enterTextField(root, "password", "aa");

        let button = retrieve(root, "[connectionButton]");
        button.handler.parentManip.listeners['click']();

        let errorMessage = retrieve(root, "[msgFieldError]");
        assert.equal(errorMessage.text, testutils.escape("Veuillez remplir correctement tous les champs"));
    });
})