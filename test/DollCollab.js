
const assert = require('assert'),
    testutils = require('../lib/testutils'),
    {given, when, loadPage, click, assertPresent} = testutils;

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
    it('should add  element  zone colab', function(){
        let {root, type} = given(()=>{
            let elements = JSON.parse('{"elements" : [ { "type" : "rect", "width" : 406, "height" : 213, "globalX" : 519, "globalY" : 191.2375, "layerIndex" : 0, "fillColor" : [ 25, 122, 230 ], "strokeColor" : [ 0, 0, 0 ] },' +
                '{ "type" : "text", "width" : 95, "height" : 52, "globalX" : 134.5, "globalY" : 98.7375, "layerIndex" : 1, "fillColor" : [ 255, 255, 255 ], "textMessage" : "dtt" },' +
                '{ "type" : "help", "width" : 80, "height" : 80, "globalX" : 906, "globalY" : 115.7375, "layerIndex" : 2 },' +
                '{ "type" : "picture", "width" : 225, "height" : 225, "globalX" : 1100, "globalY" : 274.7375, "layerIndex" : 3, "src" : "../resource/0bf4b3258fc66fa32317267f3f7c991a" }]}').elements;
            return loadPage('GameCollab', {data:{type:'Doll', label:'testDoll', elements:elements, id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
        }).then(()=>{
            assertPresent(root, 'rectElement0')
            assertPresent(root,'picElement')
            assertPresent(root, 'helpElement')
        })
    })
    // it('should add a picture zone colab', function(){
    //     let {root, type} = given(()=>{
    //         let elements = JSON.parse('{"elements" : [ { "type" : "rect", "width" : 406, "height" : 213, "globalX" : 519, "globalY" : 191.2375, "layerIndex" : 0, "fillColor" : [ 25, 122, 230 ], "strokeColor" : [ 0, 0, 0 ] }, { "type" : "text", "width" : 95, "height" : 52, "globalX" : 134.5, "globalY" : 98.7375, "layerIndex" : 1, "fillColor" : [ 255, 255, 255 ], "textMessage" : "dtt" } ]}').elements;
    //         return loadPage('GameCollab', {data:{type:'Doll', label:'testDoll', elements:elements, id:'testDollId'}, className:'Doll'});
    //     });
    //     when(()=>{
    //     }).then(()=>{
    //         assertPresent(root, 'rectElement0')
    //     })
    // })

})

