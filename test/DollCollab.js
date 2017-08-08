
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
            let elements =
                [
                    { "type" : "rect", "width" : 406, "height" : 213, "globalX" : 519, "globalY" : 191.2375,
                    "layerIndex" : 0, "fillColor" : [ 25, 122, 230 ], "strokeColor" : [ 0, 0, 0 ] },
                    { "type" : "text", "width" : 95, "height" : 52, "globalX" : 134.5, "globalY" : 98.7375,
                        "layerIndex" : 1, "fillColor" : [ 255, 255, 255 ], "textMessage" : "dtt" },
                    { "type" : "picture", "width" : 225, "height" : 225, "globalX" : 1100, "globalY" : 274.7375,
                        "layerIndex" : 3, "src" : "../resource/0bf4b3258fc66fa32317267f3f7c991a" },
                    { "type" : "help", "width" : 80, "height" : 80, "globalX" : 204, "globalY" : 113, "statementId" : "Enoncé0"},
                    { "type" : "help", "width" : 80, "height" : 80, "globalX" : 371, "globalY" : 109, "statementId" : "Enoncé1"},
                    { "type" : "help", "width" : 80, "height" : 80, "globalX" : 519, "globalY" : 105, "statementId" : "Enoncé2"}
                ];
            let objectives = [
                {"label": "objec1",
                    "rules" : {
                        "acceptedSolutions" : {},
                        "bestSolutions" : {"B1502184494107": {"Enoncé0":"r1", "Enoncé2":"r2",}}
                    }
                }, {"label": "objec2",
                    "rules" : {
                        "acceptedSolutions" : {"A1502184494147" : {"Enoncé3":"r3",}},
                        "bestSolutions" : {"B1502184494339": {"Enoncé2":"r3"}}
                    }
                },
            ];
            let reponses = [
                {"label": "r1"}, {"label": "r2"}, {"label": "r3"},
            ];
            let statements = [
                {"id": "Enoncé0"}, {"id": "Enoncé1"}, {"id": "Enoncé2"}
            ];
            return loadPage('GameCollab', {data:{type:'Doll', label:'testDoll', elements:elements, objectives:objectives,
                reponses:reponses, statements:statements, id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
        }).then(()=>{
            assertPresent(root, 'rectElement0')
            assertPresent(root,'picElement')
            assertPresent(root, 'helpElementEnoncé0')
            assertPresent(root, 'helpElementEnoncé1')
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

