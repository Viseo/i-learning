/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {enterTextField, given, when, click, assertPresent, assertMessage, loadPage} = testutils;

describe('register page', function(){
    it('should register', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses: {
                    "/auth/connect": {code: 404},
                    "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
                }
            });
        })
        click(root, 'toRegister');
        when(()=>{
            enterTextField(root, 'surname', 'paul');
            enterTextField(root, "name", "Den");
            enterTextField(root, "mail", "paul@den.fr");
            enterTextField(root, 'password', 'lollol');
            enterTextField(root, 'confirmPassword', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "popUpMessage", 'Votre compte a bien été créé !');
        });
    })
    it('should not register, incorrect email', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses: {
                    "/auth/connect": {code: 404},
                    "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
                }
            });
        })
        click(root, 'toRegister');
        when(()=>{
            enterTextField(root, 'surname', 'paul');
            enterTextField(root, "name", "Den");
            enterTextField(root, "mail", "paul @den.fr");
            enterTextField(root, 'password', 'lollol');
            enterTextField(root, 'confirmPassword', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "popUpMessage", "L'adresse email n'est pas valide");
        });
    });
    it('should not register, incorrect name', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses: {
                    "/auth/connect": {code: 404},
                    "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
                }
            });
        })
        click(root, 'toRegister');
        when(()=>{
            enterTextField(root, 'surname', 'paul');
            enterTextField(root, "name", "46654");
            enterTextField(root, "mail", "paul@den.fr");
            enterTextField(root, 'password', 'lollol');
            enterTextField(root, 'confirmPassword', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "popUpMessage", "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés");
        });
    });
    it('should not register, already used email', function(){
        let {root, state} = given(()=>{
            return loadPage("Connection", {
                mockResponses:{
                    "/auth/connect": {code: 404},
                    "/users/inscription": {code: 403, content: {reason:'Adresse mail déjà utilisée ! '}}
                }
            });
        })
        click(root, 'toRegister');
        when(()=>{
            enterTextField(root, 'surname', 'paul');
            enterTextField(root, "name", "Den");
            enterTextField(root, "mail", "paul@den.fr");
            enterTextField(root, 'password', 'lollol');
            enterTextField(root, 'confirmPassword', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "popUpMessage", 'Adresse mail déjà utilisée ! ');
        });

    });
    it('should find new focused field ', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage("Connection");
        })
        click(root, 'toRegister');
        when(()=>{
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:9, shiftKey:true, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:13, preventDefault:()=>{}});
        }).then(()=>{
            assertPresent(root, 'confirmPasswordselectedInput');
        });

    });

})