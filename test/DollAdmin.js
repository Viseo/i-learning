/**
 * Created by DMA3622 on 23/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    FModels = require('../src/Models').Models,
    models = FModels({}, {}),
    {given, when, loadPage, retrieve, clickElement, assertMessage, assertPresent, onChangeElement, mouseMoveElement,
    mouseUpElement, mouseUpElementOnAnother, mouseDownElement, customClick, enterTextField, rightClick} = testutils;

const ImageRuntime = {
    images: {},
    count: 0,

    getImage: function (imgUrl, onloadHandler) {
        this.count++;
        const image = {
            src: imgUrl,
            onload: onloadHandler,
            id: "i" + this.count
        };
        this.images[image.id] = image;
        return image;
    },

    imageLoaded: function (id, w, h) {
        this.images[id].width = w;
        this.images[id].height = h;
        this.images[id].onload();
    }
};
let mockResponses = {
    '/medias/images': {
        content: {
            images: [{
                imgSrc: "../resource/625dd8b7bb91c04f4f07c88500d50e19",
                name: "svg-guy.png", _id: "592c24c36a4f592c987fa84e"
            }]
        }
    },
    '/medias/upload': {content: {ack: 'ok', name: 'bidon.PNG', src: '../resource/0015254c306b9308a4fe0bac8efea0bd'} }
}

describe('Doll admin Page', function(){
    beforeEach(function(){
    })
    it('should add a text zone', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'textTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            // let txtElem = retrieve(root, '[textElement1]');
            when(()=>{
                enterTextField(root, "textElement1", "jetest");
            }).then(()=>{
                assertMessage(root, 'textElement1', 'jetest');
            })
        })
    })
    it('should add a rect zone', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
        })
    })

    it('should display context menu on text and rect', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'textTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let txtElem = retrieve(root, '[textElement1]');
            when(()=>{
                customClick(root, 'textElement1click', {which:3});
            }).then(()=>{
                let resize = retrieve(root, '[resizeOption]');
                assert(resize);
            })
        })

        when(()=>{
            clickElement(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
            when(()=>{
                customClick(root, 'rectElement1', {type:3});
            }).then(()=>{
                let resize = retrieve(root, '[resizeOption]');
                clickElement(root, 'resizeOption')
                assert(resize);
            })
        })
    })
    it('should display color list in context menu for text', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'textTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let txtElem = retrieve(root, '[textElement1]');
            when(()=>{
                customClick(root, 'textElement1click', {which:3});
            }).then(()=>{
                let color = retrieve(root, '[colorOption]');
                clickElement(root, 'colorOption');
                assert(color);
            })
        })
    })
    it('should display color list in context menu for rect', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
            when(()=>{
                rightClick(root, 'rectElement1', {x:100,y:100});
            }).then(()=>{
                let color = retrieve(root, '[colorOption]');
                clickElement(root, 'colorOption');
                assert(color);
            })
        })
    });
    it('should switch between tabs', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'rules');
        }).then(()=>{
            let button = retrieve(root, '[addSolutionButton]');
            assert(button);
        })
    })

    it('should resize a rect', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            clickElement(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
            assert(rectElem);
            when(()=>{
                rightClick(root, 'rectElement1', {x:100,y:100});
            }).then(()=>{
                clickElement(root, 'resizeOption');
                let rect = retrieve(root, '[rectElement1]');
                let size = new Object({w:rect.handler.width,h:rect.handler.height});
                mouseDownElement(root, 'botRight', {pageX:250,pageY:250});
                mouseMoveElement(root, 'botRight', {pageX:400,pageY:400});
                mouseUpElement(root, 'botRight', {pageX:400,pageY:400});
                assert.equal(size.w + 150, rect.handler.width);
                assert.equal(size.h + 150, rect.handler.height);

            })
        })
    })

    it('should add an image to the media library', function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            clickElement(root, 'pictureTab');
            clickElement(root, 'picAddImageManip');
            onChangeElement(root, 'fileExplorer');
        }).then(() => {

        })
    })

    it('should display images list then show back original sandbox list', function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            clickElement(root, 'pictureTab');
        }).then(() => {
            clickElement(root, 'picBackManip');
            assertPresent(root, 'rectTab');
            assertPresent(root, 'pictureTab');
            assertPresent(root, 'textTab');
            assertPresent(root, 'helpTab');
        })
    })
    it.skip('should drag an image and drop it to the sandbox', function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            clickElement(root, 'pictureTab');
        }).then(() => {
            mouseDownElement(root, 'img_592c24c36a4f592c987fa84e', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseDownElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMoveElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            // mouseUpElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            // }});
            mouseUpElementOnAnother(root, 'picDraggableCopy', 'mainPanel');
        })
    })
})