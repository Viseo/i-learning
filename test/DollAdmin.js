/**
 * Created by DMA3622 on 23/05/2017.
 */
const
    assert = require('assert'),
    testutils = require('../lib/testutils'),
    FModels = require('../src/Models').Models,
    models = FModels({}, {}),
    {given, when, loadPage, retrieve, click, assertMessage, assertPresent, onChangeElement, mouseMoveElement,
        mouseUpElement, mouseUpElementOnAnother, mouseDownElement, customClick, enterTextField, rightClick, mouseDown,
        mouseDownOnGlassElement, mouseMove, mouseUpOnAnother, mouseUp, mouseUpOnGlassElement, getElement} = testutils;

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
        '/medias/upload': {content: {ack: 'ok', name: 'bidon.PNG', src: '../resource/0015254c306b9308a4fe0bac8efea0bd'}},
        '/formations/doll': {content : {"valid":true}}
    },
    formationMock = {
        links: [],
        _id: "591ec683aabd34544c5bceda",
        formationId: "591ec683aabd34544c5bcedb",
        gamesCounter: {doll: 1, quizz: 0},
        label: "Agilité",
        progress: undefined,
        imageSrc: undefined,
        note: 0,
        noteCounter: 0,
        status: "NotPublished",
        levelsTab: [{
            gamesTab: [{
                formationId: "591ec683aabd34544c5bcedb",
                gameIndex: 0,
                id: "doll0",
                label: "testDoll",
                lastQuestionIndex: 0,
                levelIndex: 0,
                type: 'Doll',
                elements: [{globalX: 361, globalY: 161.6375, height: 80, layerIndex: 0, type: "help", width: 80},
                    {globalX: 499, globalY: 154, height: 80, layerIndex: 1, type: "rect", width: 80},
                    {globalX: 719, globalY: 110, height: 80, layerIndex: 2, type: "text", width: 80},
                    {globalX: 800, globalY: 140, height: 80, layerIndex: 3, type: "picture", width: 80}],
                objectives: [{label: "o1", rules: {acceptedSolutions: {}, bestSolutions: {}}},
                    {label: "o2", rules: {acceptedSolutions: {}, bestSolutions: {}}},
                    {
                        label: "o3",
                        rules: {
                            acceptedSolutions: {
                                A01: {"Enoncé0": "r1", "Enoncé1": "r3"},
                                A02: {"Enoncé0": "r2"},
                                A03: {"Enoncé2": "r1", "Enoncé1": "r2"}
                            },
                            bestSolutions: {
                                B01: {"Enoncé0": "r1", "Enoncé1": "r3"},
                                B02: {"Enoncé0": "r2"},
                                B03: {"Enoncé2": "r1", "Enoncé1": "r2"}
                            }
                        }
                    }],
                responses: [{label: "r1"}, {label: "r2"}, {label: "r3"}, {label: "r4"}],
                statements: [{id: "Enoncé0"}, {id: "Enoncé1"}, {id: "Enoncé2"}]
            }]
        }]
    },
    dollData = {
        formationId: "591ec683aabd34544c5bcedb",
        gameIndex: 0,
        id: "doll0",
        label: "testDoll",
        lastQuestionIndex: 0,
        levelIndex: 0,
        type: 'Doll',
        elements: [{globalX: 361, globalY: 161.6375, height: 80, layerIndex: 0, type: "help", width: 80},
            {globalX: 499, globalY: 154, height: 80, layerIndex: 1, type: "rect", width: 80},
            {globalX: 719, globalY: 110, height: 80, layerIndex: 2, type: "text", width: 80},
            {globalX: 800, globalY: 140, height: 80, layerIndex: 3, type: "picture", width: 80}],
        objectives: [{label: "o1", rules: {acceptedSolutions: {}, bestSolutions: {}}},
            {label: "o2", rules: {acceptedSolutions: {}, bestSolutions: {}}},
            {
                label: "o3",
                rules: {
                    acceptedSolutions: {
                        A01: {"Enoncé0": "r1", "Enoncé1": "r3"},
                        A02: {"Enoncé0": "r2"},
                        A03: {"Enoncé2": "r1", "Enoncé1": "r2"}
                    },
                    bestSolutions: {
                        B01: {"Enoncé0": "r1", "Enoncé1": "r3"},
                        B02: {"Enoncé0": "r2"},
                        B03: {"Enoncé2": "r1", "Enoncé1": "r2"}
                    }
                }
            }],
        responses: [{label: "r1"}, {label: "r2"}, {label: "r3"}, {label: "r4"}],
        statements: [{id: "Enoncé0"}, {id: "Enoncé1"}, {id: "Enoncé2"}]
    }

describe('Doll admin Page', function(){
    beforeEach(function(){
    })
    it('should add a text zone', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            click(root, 'textTab');
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
            click(root, 'rectTab');
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
            click(root, 'textTab');
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
            click(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            when(()=>{
                customClick(root, 'rectElement2', {type:3});
            }).then(()=>{
                let resize = retrieve(root, '[resizeOption]');
                click(root, 'resizeOption')
                assert(resize);
            })
        })
    })
    it('should display color list in context menu for text', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            click(root, 'textTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let txtElem = retrieve(root, '[textElement1]');
            when(()=>{
                customClick(root, 'textElement1click', {which:3});
            }).then(()=>{
                let color = retrieve(root, '[colorOption]');
                click(root, 'colorOption');
                assert(color);
            })
        })
    })
    it('should display color list in context menu for rect', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            click(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
            when(()=>{
                rightClick(root, 'rectElement1', {x:100,y:100});
            }).then(()=>{
                let color = retrieve(root, '[colorOption]');
                click(root, 'colorOption');
                assert(color);
            })
        })
    });
    it('should switch between tabs', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            click(root, 'rules');
        }).then(()=>{
            let button = retrieve(root, '[headerTitle]');
            assert(button);
        })
    })

    it('should resize a rect', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:{type:'Doll', label:'testDoll', id:'testDollId'}, className:'Doll'});
        });
        when(()=>{
            click(root, 'rectTab');
        }).then(()=>{
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
            assert(rectElem);
            when(()=>{
                click(root, 'rectElement1', {x:100,y:100});
            }).then(()=>{
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
            click(root, 'pictureTab');
            click(root, 'picAddImageManip');
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
            click(root, 'pictureTab');
        }).then(() => {
            click(root, 'picBackManip');
            assertPresent(root, 'rectTab');
            assertPresent(root, 'pictureTab');
            assertPresent(root, 'textTab');
            assertPresent(root, 'helpTab');
        })
    })
    it('should drag an image and drop it to the sandbox', function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            click(root, 'pictureTab');
        }).then(() => {
            mouseDownElement(root, 'img_592c24c36a4f592c987fa84e', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseDownElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMoveElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});

            mouseUpElementOnAnother(root, 'picDraggableCopy', 'mainPanel');
            assertPresent(root,'picElement');
        })
    });
    it('should open modification menu on rect and change rect opacity', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            mouseDown(root, 'gaugeIndicator', {pageX: 10000, pageY:0, preventDefault: () => {
            }});
            mouseMove(root, 'gaugeIndicator', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseUp(root, 'gaugeIndicator', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            assertPresent(root,'rightMenu');
        })
    });
    it('should dnd statement in sandbox', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            mouseDown(root, 'helpTab', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseDown(root, 'helpTabCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMove(root, 'helpTabCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});

            mouseUpOnAnother(root, 'helpTabCopy', 'mainPanel');
        }).then(()=>{
            assertPresent(root, 'Enoncé0ImgElement');
        })
    })
    it('should test right menu for a rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
            let rectElem = retrieve(root, '[rectElement1]');
        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            assertPresent(root,'rightMenu');
        })
    })
    it('should test position in right menu for rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});

        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            enterTextField(root,'inputPosX', '100');
            enterTextField(root, 'inputPosY', '100');
            let rectElem = retrieve(root, '[rectElement1]');
            assert.equal(rectElem.handler.parentManip.x, 100);
            assert.equal(rectElem.handler.parentManip.y, 100);
            enterTextField(root,'inputPosX', 'abc');
            assertPresent(root, 'errorInputMessage');
        });
    })
    it('should test size in right menu for rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});

        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            enterTextField(root,'inputSizeW', '100');
            enterTextField(root, 'inputSizeH', '100');
            let rectElem = retrieve(root, '[rectElement1]');
            assert.equal(rectElem.handler.width, 100);
            assert.equal(rectElem.handler.height, 100);
            enterTextField(root,'inputSizeW', 'abc');
            assertPresent(root, 'errorInputMessage');
        });
    })
    it('should test size in right menu for rect with respect to proportion', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            enterTextField(root,'inputSizeW', '100');
            enterTextField(root, 'inputSizeH', '100');
            let rectElem = retrieve(root, '[rectElement1]');
            assert.equal(rectElem.handler.width, 100);
            assert.equal(rectElem.handler.height, 100);
            click(root, 'keepProportionButton');
            enterTextField(root,'inputSizeW', '150');
            assert.equal(rectElem.handler.height, 150);
        });
    });
    it('should test color for rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
        }).then(()=>{
            rightClick(root,'rectElement1', {});
            click(root,'editOption');
            click(root, 'borderColor');
            let rec = retrieve(root, '[rectElement1]');
            let color = retrieve(root, '[color1]').handler.color;
            click(root, 'color1');
            assert.equal(true, rec.handler.strokeColor == color);

            click(root, 'backgroundColor');
            let rec2 = retrieve(root, '[rectElement1]');
            let color2 = retrieve(root, '[color1]').handler.color;
            click(root, 'color1');
            assert.equal(true, rec.handler.fillColor == color);
        });
    });
    it('should test deepness of a rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
        }).then(()=> {
            rightClick(root, 'rectElement1', {});
            click(root, 'forwardOption');
            rightClick(root, 'rectElement1', {});
            click(root, 'backwardOption');
            rightClick(root, 'rectElement1', {});
            click(root, 'foregroundOption');
            rightClick(root, 'rectElement1', {});
            click(root, 'backgroundOption');
        })
    });
    it('should test selection and deselection of a rect', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(()=>{
            click(root, 'rectTab');
            mouseDownElement(root, 'mainPanel', {x:150, y:150});
            mouseMoveElement(root, 'mainPanel', {x: 250, y: 250});
            mouseUpElement(root, 'mainPanel', {x:250,y:250});
        }).then(()=> {
            click(root, 'rectElement1');
            let rect = retrieve(root,'[rectElement1]')
            assert.equal(true, state.currentPresenter.view.selectedElement == rect.handler);
            click(root, 'mainPanel');
            assert.equal(true, state.currentPresenter.view.selectedElement == null)
        })
    });
    it('should add an image in the panel and resize it', function() {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {
                mockResponses,
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            click(root, 'pictureTab');
        }).then(() => {
            mouseDownElement(root, 'img_592c24c36a4f592c987fa84e', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseDownElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMoveElement(root, 'picDraggableCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});

            mouseUpElementOnAnother(root, 'picDraggableCopy', 'mainPanel');
            assertPresent(root,'picElement');
            rightClick(root, 'picElement', {x:0, y:0});
            click(root, 'resizeOption');
            let img = retrieve(root, '[picElement]');
            let size = new Object({w:img.handler.width,h:img.handler.height});
            mouseDownElement(root, 'botRight', {pageX:250,pageY:250});
            mouseMoveElement(root, 'botRight', {pageX:400,pageY:400});
            mouseUpElement(root, 'botRight', {pageX:400,pageY:400});
            assert.equal(size.w + 150, img.handler.width);
            assert.equal(size.h + 150, img.handler.height);
        })
    })

    it('should load objectives, responses and linked elements', function(){
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {data:dollData, className:'Doll'});
        });
        when(()=>{
            click(root, 'rules');
        }).then(()=>{
            let button = retrieve(root, '[headerTitle]');
            assert(button);
        })
    })

    it('should add objectives and responses', function () {
        let {root, state, runtime} = given(()=>{
            return loadPage('GameAdmin', {
                data: {type: 'Doll', label: 'testDoll', id: 'testDollId'},
                className: 'Doll'
            });
        });
        when(() => {
            customClick(root, 'objectivesInputClick', {
                which: 1, preventDefault: () => {
                }
            });
            enterTextField(root, 'objectivesInput', 'o1');
            runtime.listeners['keydown']({
                keyCode: 13, preventDefault: () => {
                }
            });
            enterTextField(root, 'objectivesInput', 'o2');
            runtime.listeners['keydown']({
                keyCode: 13, preventDefault: () => {
                }
            });
            customClick(root, 'responsesInputClick', {
                which: 1, preventDefault: () => {
                }
            });
            enterTextField(root, 'responsesInput', 'r1');
            runtime.listeners['keydown']({
                keyCode: 13, preventDefault: () => {
                }
            });
            enterTextField(root, 'responsesInput', 'r2');
            runtime.listeners['keydown']({
                keyCode: 13, preventDefault: () => {
                }
            });
            mouseDown(root, 'helpTab', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseDown(root, 'helpTabCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMove(root, 'helpTabCopy', {pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseUpOnAnother(root, 'helpTabCopy', 'mainPanel');
            mouseDownOnGlassElement(root, 'Enoncé0ImgElement');
            mouseUpOnGlassElement(root, 'Enoncé0ImgElement');
        }).then(() => {
        })
    })

    it ('should rename the doll game', function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {data: dollData, className: 'Doll'});
        });
        when(() => {
            customClick(root, 'titleLabelClick', {
                which: 1, preventDefault: () => {
                }
            });
            enterTextField(root, 'titleLabelInput', 'Faire chier Minh');
            runtime.listeners['keydown']({
                keyCode: 13, preventDefault: () => {
                }
            });
        }).then(() => {
        })
    })

    it('should remove all objectives and responses from the doll' , function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {data: dollData, className: 'Doll'});
        });
        let _removeItemDollDnD = (root,label) => {
            let id = label+'Manip';
            assertPresent(root, id);
            mouseDown(root,id,{pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseMove(root,id,{pageX: 0, pageY:0, preventDefault: () => {
            }});
            mouseUp(root, id, {pageX: 0, pageY:10000, preventDefault: () => {
            }});
        }
        when(() => {
            _removeItemDollDnD(root, 'o1');
            _removeItemDollDnD(root, 'o2');
            _removeItemDollDnD(root, 'o3');
            _removeItemDollDnD(root, 'r1');
            _removeItemDollDnD(root, 'r2');
            _removeItemDollDnD(root, 'r3');
        }).then(() => {
        });
    })

    it('should add new rule with one best and accepted solution' , function () {
        let {root, state, runtime} = given(() => {
            return loadPage('GameAdmin', {mockResponses, data: dollData, className: 'Doll',
                beforeLoad: (page) => {
                page.state.formation = page.state.createFormation(formationMock);
            }});
        });
        let _displaySelectList = () => {
            let selectItemList = getElement(root, 'objectivesList'),
                selectItemListButton = selectItemList.handler.parentManip.parentObject.getSelectButton();
            selectItemListButton.glass.component.listeners['click']();
        }
        when(() => {
            click(root, 'rules');
            // assertPresent(root, 'objectivesList');

            // click(root, )
            _displaySelectList();
            click(root, 'newBestSolutionButton');
            click(root, 'newAcceptedSolutionButton');
            click(root, 'saveButtonDoll');
            // let objectives = getElement(root, 'objectivesList'),
                // displayedObjective = objectives.handler.parentManip.parentObject.getSelectedButtonText();
            // if (displayedObjective) {
            //     let currentObjective = getElement(root, 'currentObjective')
            //     if (displayedObjective == currentObjective){
            //
            //     }
            // }
        }).then(() => {
        })
    })
})