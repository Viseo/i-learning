/**
 * Created by TBE3610 on 19/05/2017.
 */

const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {retrieve, enterTextField, given, when, click, assertMessage, loadPage, assertMissing, loadPageWithFormation} = testutils;

describe('register page', function(){
    it('should register', function(){
        let {root, state} = given(()=>{
            return loadPage("Register", {
                "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
            });
        })
        when(()=>{
            enterTextField(root, 'Prénom', 'paul');
            enterTextField(root, "Nom", "Den");
            enterTextField(root, "Adresse mail", "paul@den.fr");
            enterTextField(root, 'Mot de passe', 'lollol');
            enterTextField(root, 'Confirmer votre mot de passe', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "successMessage", 'Votre compte a bien été créé !');
        });

        state.loadPresenterRegister();
    })
    it('should not register, incorrect email', function(){
        let {root, state} = given(()=>{
            return loadPage("Register", {
                "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
            });
        })
        when(()=>{
            enterTextField(root, 'Prénom', 'paul');
            enterTextField(root, "Nom", "Den");
            enterTextField(root, "Adresse mail", "paul @den.fr");
            enterTextField(root, 'Mot de passe', 'lollol');
            enterTextField(root, 'Confirmer votre mot de passe', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "msgFieldError", "L'adresse email n'est pas valide");
        });
    });
    it('should not register, incorrect name', function(){
        let {root, state} = given(()=>{
            return loadPage("Register", {
                "/users/inscription": {code: 200, content: {ack: "OK", user: {}}}
            });
        })
        when(()=>{
            enterTextField(root, 'Prénom', 'paul');
            enterTextField(root, "Nom", "46654");
            enterTextField(root, "Adresse mail", "paul@den.fr");
            enterTextField(root, 'Mot de passe', 'lollol');
            enterTextField(root, 'Confirmer votre mot de passe', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "msgFieldError", "Seuls les caractères alphabétiques, le tiret, l'espace et l'apostrophe sont autorisés");
        });

        state.loadPresenterRegister();
    });
    it('should not register, already used email', function(){
        let {root, state} = given(()=>{
            return loadPage("Register", {
                "/users/inscription": {code: 403, content: {reason:'Adresse mail déjà utilisée ! '}}
            });
        })
        when(()=>{
            enterTextField(root, 'Prénom', 'paul');
            enterTextField(root, "Nom", "Den");
            enterTextField(root, "Adresse mail", "paul@den.fr");
            enterTextField(root, 'Mot de passe', 'lollol');
            enterTextField(root, 'Confirmer votre mot de passe', 'lollol');
            click(root, 'saveButton');
        }).then(()=>{
            assertMessage(root, "msgFieldError", 'Adresse mail déjà utilisée ! ');
        });

    });
    it('should find new focused field, ', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage("Register", {
                "/users/inscription": {code: 403, content: {reason:'Adresse mail déjà utilisée ! '}}
            });
        })
        when(()=>{
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:9, preventDefault:()=>{}});
            runtime.listeners['keydown']({keyCode:13, preventDefault:()=>{}});
        }).then(()=>{
            let focus = retrieve(root, '[PrénomselectedInput]');
            assert(focus);
        });

    });

})