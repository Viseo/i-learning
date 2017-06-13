
const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {given, when, loadPage} = testutils;

describe('doll collab', function(){
    it('should display', function(){
       let {root} = given(() => {
           return loadPage('GameCollab', {
               data: {},
               className: "Doll"
           })
       })

        when(() => {

        }).then(() => {

        })
    });
})

