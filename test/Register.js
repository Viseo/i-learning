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

        loadPresenterRegister() {
            this.currentPresenter && this.currentPresenter.flushView();
            this.currentPresenter = new globalVariables.RegisterP(this);
            this.currentPresenter.displayView();
        }
    }

    return {State};
}

describe('register page', function(){
    it('should register', function(){
        let {root, state} = main(FModelMock);

        state.loadPresenterRegister();
    })
})