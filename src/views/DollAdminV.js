exports.DollAdminV = function (globalVariables) {
    const View = globalVariables.View,
        Manipulator = globalVariables.Handlers.Manipulator,
        drawing = globalVariables.drawing,
        drawings = globalVariables.drawings,
        gui = globalVariables.gui,
        svg = globalVariables.svg,
        svgr = globalVariables.runtime,
        Helpers = globalVariables.Helpers,
        IconCreator = globalVariables.Icons.IconCreator,
        ListManipulatorView = globalVariables.Lists.ListManipulatorView,
        resizeStringForText = globalVariables.Helpers.resizeStringForText,
        SelectItemList2 = globalVariables.Lists.SelectItemList2,
        popUp = globalVariables.popUp,
        installDnD = globalVariables.gui.installDnD;

    var
        INPUT_SIZE = {w: 400, h: 30},
        PANEL_SIZE = {w: drawing.width - 2 * MARGIN, h: drawing.height * 0.7},
        LEFT_PANEL_SIZE = 400,
        SANDBOX_SIZE = {
            w: PANEL_SIZE.w * 6 / 9,
            h: PANEL_SIZE.h - 4 * MARGIN,
            header: {w: PANEL_SIZE.w * 6 / 9, h: 100}
        },
        RIGHTBOX_SIZE = {
            w: PANEL_SIZE.w - SANDBOX_SIZE.w - 3 * MARGIN, h: (PANEL_SIZE.h - 6 * MARGIN) / 2,
            header: {w: PANEL_SIZE.w - SANDBOX_SIZE.w, h: 0.2 * (PANEL_SIZE.h - 5 * MARGIN) / 2}
        },
        LIST_SIZE = {
            w: RIGHTBOX_SIZE.w - 2 * MARGIN,
            h: RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h - 0.8 * INPUT_SIZE.h - MARGIN * 4
        },
        TAB_SIZE = {w: 0.1 * PANEL_SIZE.w, h: 0.1 * PANEL_SIZE.h},
        HEADER_TILE = INPUT_SIZE.h*2 - 2 * MARGIN,
        CONTEXT_TILE_SIZE = {w: 150 - 2 * MARGIN, h: 27},
        NB_ELEMENT_RIGHT_CLICK = 3,
        CHEVRON_RCLICK_SIZE =  {w: 75, h: 20};

    class DollAdminV extends View {
        constructor(presenter) {
            super(presenter);
            this.label = this.getLabel();
            this.rulesDisplay = false;
            this.responses = this.getResponses();
            this.objectives = this.getObjectives();
            this.elements = this.loadElements();
            this.declareActions();
        }


        loadElements(){
            return this.getElements().map((elemDetails, index)=>{
                let manip = new Manipulator(this);
                let elem;
                switch(elemDetails.type){
                    case 'rect':
                        elem = new svg.Rect(elemDetails.width, elemDetails.height);
                        elem.color(elemDetails.fillColor, 1, elemDetails.strokeColor);
                        elem.mark('rectElement' + index);
                        this._assignRectElementEvents(elem, manip);
                        manip.add(elem);
                        manip.childObject = elem;
                        break;
                    case 'text':
                        elem = new gui.TextField(0, 0, elemDetails.width, elemDetails.height, '');
                        elem.color([elemDetails.fillColor, 1, myColors.grey])
                        elem.editColor([elemDetails.fillColor, 1, myColors.grey])
                        elem.message(elemDetails.textMessage);
                        elem.parentManip = manip;
                        elem.onClick(() => {
                            this.selectElement(elem);
                        })
                        elem.onRightClick((event)=>{
                            this.textRightClick(elem, manip, event);
                            this.selectElement(elem);
                        })
                        elem.glass.mark('textElement' + index + 'click');
                        elem.mark('textElement' + index);
                        manip.add(elem.component);
                        manip.childObject = elem;

                        break;
                    case 'picture':
                        elem = new svg.Image(elemDetails.src);
                        elem.dimension(elemDetails.width, elemDetails.height);
                        manip.add(elem);
                        svg.addEvent(elem, 'contextmenu', (event) => {
                            this.selectElement(elem);
                            this.imageRightClick(elem, manip, event);
                        });
                        svg.addEvent(elem, 'click', event => {
                            this.selectElement(elem);
                        })
                        elem.mark('picElement');
                        manip.childObject = elem;
                        let conf2 = {
                            drag: (what, x, y) => {
                                svgr.attr(drawing.component, 'style', 'cursor:all-scroll');
                                return {x: x, y: y};
                            },
                            drop: (what, whatParent, x, y) => {
                                return {x: x, y: y, parent: this.sandboxMain.content};
                            },
                            moved: () => {
                                svgr.attr(drawing.component, 'style', 'cursor:auto');
                                return true;
                            }
                        };
                        installDnD(manip, drawings.component.glass.parent.manipulator.last, conf2);
                        break;
                    case 'help':
                        elem = new svg.Rect(elemDetails.width, elemDetails.height).color(myColors.white, 1, myColors.black);
                        let elemText = new svg.Text("?").font(FONT, 45).position(0,15);
                        let txt = new svg.Text(elemDetails.statementId).font(FONT, 20).position(0,-elemDetails.height/2 - 1.5*MARGIN);
                        manip.add(elem).add(elemText).add(txt);
                        manip.childObject = elem;
                        elem.statementText = txt;
                        elem.questionMark = elemText;
                        elem.statementId = elemDetails.statementId;
                        svg.addEvent(elem, 'click', (event) => {
                            this.selectElement(elem);
                            if (event.which == 3) {
                                this.imageRightClick(elem, manip, event);
                            }
                        });
                        manip.mark('helpElement');
                        let conf = {
                            drag: (what, x, y) => {
                                svgr.attr(drawing.component, 'style', 'cursor:all-scroll');
                                return {x: x, y: y};
                            },
                            drop: (what, whatParent, x, y) => {
                                return {x: x, y: y, parent: this.sandboxMain.content};
                            },
                            moved: () => {
                                svgr.attr(drawing.component, 'style', 'cursor:auto');
                                return true;
                            }
                        };
                        installDnD(manip, drawings.component.glass.parent.manipulator.last, conf);
                        break;
                }
                elem.type = elemDetails.type;
                manip.move(elemDetails.globalX, elemDetails.globalY);
                return elem;
            });
        }

        declareActions(){
            let toggleMode = (mode) => {
                this.actionModes.actions['none']();
                if (Object.keys(this.actionModes.actions).indexOf(mode) >= 0) {
                    this.actionModes.currentMode = mode;
                    this.actionModes.actions[mode]();
                }
            }

            this.actions = [];
            this.actionTabs = [];
            let textA = new svg.Text('T').font(FONT, HEADER_TILE).position(0, HEADER_TILE / 3).mark('textTab');
            let rectA = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.blue).mark('rectTab');
            let pictureA = new svg.Image('../../images/ajoutImage.png').dimension(HEADER_TILE, HEADER_TILE).mark('pictureTab');
            let helpA = new svg.Image('../../images/info.png').dimension(HEADER_TILE, HEADER_TILE).mark('helpTab');

            helpA.onMouseDown((event) => this.addHelpIcon(helpA, event));
            this.width = drawing.width;
            this.height = drawing.height;
            this.actionModes = {
                actions: {
                    'text': () => {
                        svgr.attr(drawing.component, 'style', 'cursor: crosshair');
                        svg.addEvent(this.sandboxMain.component, 'mousedown', (event) => {
                            this.textZoning(event)
                        });
                    },
                    'rect': () => {
                        svgr.attr(drawing.component, 'style', 'cursor: crosshair');
                        svg.addEvent(this.sandboxMain.component, 'mousedown', (event) => {
                            this.rectZoning(event);
                        })
                    },
                    'picture': () => {
                        this.displayPictureNavigation();
                    },
                    'help': () => {

                    }, 'none': () => {
                        svg.removeEvent(this.sandboxMain.component, 'mousedown');
                        svg.removeEvent(this.sandboxMain.component, 'mousemove');
                        svg.removeEvent(this.sandboxMain.component, 'mouseup');
                        svgr.attr(drawing.component, 'style', 'cursor: auto');
                        this.actionModes.currentMode = 'none';
                    }
                },
                currentMode: 'none'
            };
            this.actions.push(textA, rectA, pictureA, helpA);
            svg.addEvent(textA, 'click', () => {
                toggleMode('text')
            });
            svg.addEvent(rectA, 'click', () => {
                toggleMode('rect')
            });
            svg.addEvent(pictureA, 'click', () => {
                toggleMode('picture')
            });
            // svg.addEvent(helpA, 'click', () => {
            //     toggleMode('help')
            // });
            for (let i = 0; i < this.actions.length; i++) {
                let manip = new Manipulator(this);
                let rect = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.white, 1, myColors.grey).corners(3, 3);
                manip.add(rect);
                manip.add(this.actions[i]);
                manip.addEvent('click', this.actions[i].component.listeners['click']);
                this.actionTabs.push(manip);
            }
        }

        _createDeepnessElement(manipulator) {
            let toForeground = (manipulator) => {
                this.sandboxMain.content.remove(manipulator.component);
                this.sandboxMain.content.add(manipulator.component);
                let index = this.elements.indexOf(manipulator.childObject);
                this.elements.splice(index, 1);
                this.elements.push(manipulator.childObject);
            }
            let toBackground = (manipulator) => {
                let temp = [];
                this.sandboxMain.content.children.forEach((elem) => {
                    if (elem !== manipulator.component) {
                        temp.push(elem);
                    }
                })
                this.sandboxMain.content.clear();
                this.sandboxMain.content.add(manipulator.component);
                temp.forEach((elem) => {
                    this.sandboxMain.content.add(elem);
                })
                let index = this.elements.indexOf(manipulator.childObject);
                this.elements.splice(index, 1);
                this.elements.unshift(manipulator.childObject);
            }
            let _switchManipulators = (manipulator, withBefore) => {
                let temp = [];
                let children = this.sandboxMain.content.children;
                let manipIndex = children.indexOf(manipulator.component);
                if (manipIndex !== -1) {
                    if (withBefore) {
                        if (manipIndex === 0) return;
                        manipIndex--;
                    } else {
                        if (manipIndex === children.length - 1) return;
                    }
                    while (children.length > manipIndex) {
                        temp.push(children[manipIndex]);
                        this.sandboxMain.content.remove(children[manipIndex]);
                    }
                    this.sandboxMain.content.add(temp[1]);
                    this.sandboxMain.content.add(temp[0]);
                    for (let i = 2; i < temp.length; i++) {
                        this.sandboxMain.content.add(temp[i]);
                    }
                    if(withBefore){
                        let index = this.elements.indexOf(manipulator.childObject);
                        this.elements[index] = this.elements[index-1];
                        this.elements[index-1] = manipulator.childObject;
                    }else{
                        let index = this.elements.indexOf(manipulator.childObject);
                        this.elements[index] = this.elements[index+1];
                        this.elements[index+1] = manipulator.childObject;
                    }
                }
            }
            let forward = (manipulator) => {
                _switchManipulators(manipulator);
            }
            let backward = (manipulator) => {
                _switchManipulators(manipulator, true);
            }

            let forwardItem = this._makeClickableItem('Avancer', () => {
                forward(manipulator);
                this.removeContextMenu();
            })
            let backwardItem = this._makeClickableItem('Reculer', () => {
                backward(manipulator);
                this.removeContextMenu();
            })
            let foregroundItem = this._makeClickableItem('Premier plan', () => {
                toForeground(manipulator);
                this.removeContextMenu();
            })
            let backgroundItem = this._makeClickableItem('Arrière plan', () => {
                toBackground(manipulator);
                this.removeContextMenu();
            })
            forwardItem.mark('forwardOption');
            backwardItem.mark('backwardOption');
            foregroundItem.mark('foregroundOption');
            backgroundItem.mark('backgroundOption');

            return [foregroundItem, backgroundItem, forwardItem, backwardItem];
        }

        displayPictureNavigation() {
            let conf = {
                drop: (what, whatParent, x, y) => {
                    let globalPoints = whatParent.globalPoint(x, y);
                    let target = this.sandboxManip.last.getTarget(globalPoints.x, globalPoints.y);

                    if (target && target == this.sandboxMain.back) {
                        let imgForDim = svgr.getDimensionFromImage(what.components[0].src);

                        let picInPanelManip = new Manipulator(this);
                        let picInPanel = new svg.Image(what.components[0].src);
                        picInPanel.dimension(imgForDim.width, imgForDim.height);
                        picInPanel.type = 'picture';
                        picInPanelManip.add(picInPanel);

                        let localPoints = this.sandboxMain.content.localPoint(x, y);
                        picInPanelManip.move(localPoints.x, localPoints.y);

                        svg.addEvent(picInPanel, 'contextmenu', (event) => {
                            this.selectElement(picInPanel);
                            this.imageRightClick(picInPanel, picInPanelManip, event);
                        });
                        svg.addEvent(picInPanel, 'click', event => {
                            this.selectElement(picInPanel);
                        })

                        this.elements.push(picInPanel);
                        this.sandboxMain.content.add(picInPanelManip.component);
                        picInPanelManip.childObject = picInPanel;
                        picInPanel.mark('picElement');
                        let conf = {
                            drag: (what, x, y) => {
                                svgr.attr(drawing.component, 'style', 'cursor:all-scroll');
                                return {x: x, y: y};
                            },
                            drop: (what, whatParent, x, y) => {
                                return {x: x, y: y, parent: this.sandboxMain.content};
                            },
                            moved: () => {
                                svgr.attr(drawing.component, 'style', 'cursor:auto');
                                return true;
                            }
                        };
                        installDnD(picInPanelManip, this.sandboxMain.content, conf);
                    }
                    return {x: what.x, y: what.y, parent: whatParent};
                },
                moved: (what) => {
                    what.flush();
                    return true;
                }
            };
            var createDraggableCopy = (pic) => {
                let picManip = new Manipulator(this).addOrdonator(1);
                let point = pic.globalPoint(0, 0);
                picManip.move(point.x, point.y);
                let picCopy = pic.duplicate(pic);
                picManip.set(0, picCopy);
                picManip.mark('picDraggableCopy');
                drawings.piste.add(picManip);

                installDnD(picManip, drawings.component.glass.parent.manipulator.last, conf);
                svg.event(drawings.component.glass, "mousedown", {
                    pageX: picManip.x, pageY: picManip.y, preventDefault: () => {
                    }
                });
            };
            let _createPopUpPicture = () => {
                const onChangeFileExplorerHandler = () => {
                    let files = this.fileExplorer.component.files;
                    if (files && files[0]) {
                        this.uploadImageByFile(files[0], () => {
                        }).then((data) => {
                            let pictureAddManip = new Manipulator(this);
                            let pic = new svg.Image(data.src).dimension(HEADER_TILE, HEADER_TILE);
                            pictureAddManip.add(pic);

                            pic.onMouseDown(() => createDraggableCopy(pic));
                            this.listViewPicture.addManipInIndex(pictureAddManip, 2);
                            this.listViewPicture.refreshListView();
                        });
                    }
                };
                const fileExplorerHandler = () => {
                    if (!this.fileExplorer) {
                        let globalPointCenter = {x: drawing.w / 2, y: drawing.h / 2};
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.width / 5,
                            height: this.height / 2
                        };
                        this.fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        this.fileExplorer.type("file");
                        svg.addEvent(this.fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(this.fileExplorer.component, "accept", "image/*");
                        svg.runtime.attr(this.fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(this.fileExplorer.component, "hidden", "true");
                        drawings.component.add(this.fileExplorer);
                        this.fileExplorer.fileClick = function () {
                            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                        }
                    }
                    this.fileExplorer.fileClick();
                };

                fileExplorerHandler();

            };

            if (!this.listViewPicture) {
                var _onClickBack = () => {
                    this.sandboxManip.remove(this.listViewPicture.manipulator);
                };

                this.listViewPicture =
                    new ListManipulatorView([], 'H', SANDBOX_SIZE.w, SANDBOX_SIZE.header.h, 25, 50, HEADER_TILE, HEADER_TILE, 8, undefined, 25);

                let picBackManip = new Manipulator(this);
                let picBack = new svg.Image('../../images/doll/back.png').dimension(HEADER_TILE, HEADER_TILE);
                picBackManip.add(picBack);
                this.listViewPicture.add(picBackManip);

                let picAddImageManip = new Manipulator(this);
                let picAddImage = new svg.Image('../../images/ajoutImage.png').dimension(HEADER_TILE, HEADER_TILE);
                picAddImageManip.add(picAddImage);
                this.listViewPicture.add(picAddImageManip);

                picBackManip.addEvent('click', _onClickBack);
                picBackManip.mark('picBackManip');
                picAddImageManip.addEvent('click', _createPopUpPicture);
                picAddImageManip.mark('picAddImageManip');

                this.getImages().then((images) => {
                    images.images.forEach(ele => {
                        let picManip = new Manipulator(this);
                        let pic = new svg.Image(ele.imgSrc).dimension(HEADER_TILE, HEADER_TILE);
                        picManip.add(pic);
                        this.listViewPicture.add(picManip);

                        pic.onMouseDown(() => createDraggableCopy(pic));
                        pic.mark('img_' + ele._id);
                    });
                    this.listViewPicture.refreshListView();
                });

                this.listViewPicture.getListElements().forEach(ele => {
                    let rect = new svg.Rect(HEADER_TILE, HEADER_TILE).color(myColors.none, 1, myColors.grey).corners(3, 3);
                    ele.add(rect);
                });

                this.sandboxManip.add(this.listViewPicture.manipulator);
            } else {
                this.sandboxManip.add(this.listViewPicture.manipulator);
            }
            this.listViewPicture.refreshListView();
        };

        displayPictureResponse(responsesManip, responses) {
            let _createPopUpPicture = () => {
                const onChangeFileExplorerHandler = () => {
                    let files = this.fileExplorer.component.files;
                    if (files && files[0]) {
                        this.uploadImageByFile(files[0], () => {
                        }).then((data) => {
                            let pictureAddManip = new Manipulator(this);
                            let pic = new svg.Image(data.src)
                                .dimension(pictureResponseSize, pictureResponseSize);
                            pictureAddManip.add(pic);

                            pic.onMouseDown(() => {
                                this.selectElement(pic);
                                this.selectedElement.response = true;
                            });
                            this.listViewPictureResponse.addManipInIndex(pictureAddManip, 1);
                            this.listViewPictureResponse.refreshListView();
                        });
                    }
                };
                const fileExplorerHandler = () => {
                    if (!this.fileExplorer) {
                        let globalPointCenter = {x: drawing.w / 2, y: drawing.h / 2};
                        var fileExplorerStyle = {
                            leftpx: globalPointCenter.x,
                            toppx: globalPointCenter.y,
                            width: this.width / 5,
                            height: this.height / 2
                        };
                        this.fileExplorer = new svg.TextField(fileExplorerStyle.leftpx, fileExplorerStyle.toppx, fileExplorerStyle.width, fileExplorerStyle.height);
                        this.fileExplorer.type("file");
                        svg.addEvent(this.fileExplorer, "change", onChangeFileExplorerHandler);
                        svg.runtime.attr(this.fileExplorer.component, "accept", "image/*");
                        svg.runtime.attr(this.fileExplorer.component, "id", "fileExplorer");
                        svg.runtime.attr(this.fileExplorer.component, "hidden", "true");
                        drawings.component.add(this.fileExplorer);
                        this.fileExplorer.fileClick = function () {
                            svg.runtime.anchor("fileExplorer") && svg.runtime.anchor("fileExplorer").click();
                        }
                    }
                    this.fileExplorer.fileClick();
                };

                fileExplorerHandler();

            };  // TODO uniformiser pour this.listViewPicture & this.listViewPictureResponse
            let createMiniature = (response) => {
                let miniature = {
                    border: new svg.Line(-LIST_SIZE.w / 2 + 2 * MARGIN, 15, LIST_SIZE.w / 2 - 2 * MARGIN, 15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(response.label).font(FONT, 18).position(0, 6),
                    manip: new Manipulator(this).mark(response.label + 'Manip'),
                    image: response.selectedSrc
                };
                miniature.manip.text = miniature.text;
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                if (miniature.image) {
                    let picImage = new svg.Image(miniature.image).dimension(27, 20),
                        picImageManip = new Manipulator(this);
                    picImageManip.add(picImage);
                    picImageManip.move(-LIST_SIZE.w/2 + picImage.width,0);
                    miniature.manip.add(picImageManip);
                }
                miniature.text.markDropID('responsesDrop');
                miniature.border.markDropID('responsesDrop');
                let conf = {
                    drop: (what, whatParent, finalX, finalY) => {
                        let point = whatParent.globalPoint(finalX, finalY);
                        let target = this.manipulator.last.getTarget(point.x, point.y);
                        if (!target || target && target.dropID != 'responsesDrop' || !target.dropID) {
                            this.responsesList.removeElementFromList(what);
                            this.removeResponse(what.text.messageText);
                            what.flush();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what) => {
                        this.responsesList.resetAllMove();
                        this.responsesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let addResponsePictureHandler = () => {
                let newResponse = {label: this.responsesPictureInput.textMessage};
                if (this.selectedElement) {
                    newResponse.selectedSrc = this.selectedElement.src;
                }
                if (newResponse.label == '') {
                    popUp.display('Veuiller entrer un texte ', this.manipulator);
                } else if (newResponse.selectedSrc && this.selectedElement.response) {
                        let mini = createMiniature(newResponse);
                        this.responsesList.add(mini.manip);
                        this.responsesList.refreshListView();
                        this.responsesPictureInput.message('');
                        this.addResponse(newResponse);
                        this.selectElement(null);
                } else {
                    popUp.display('Veuiller sélectionner une image de la liste des réponses ', this.manipulator);
                }
            }
            let pictureResponseSize = 0.8 * RIGHTBOX_SIZE.header.h;
            let picAddImageManip = new Manipulator(this);
            let picAddImage = new svg.Image('../../images/ajoutImage.png')
                .dimension(pictureResponseSize, pictureResponseSize);
            this.listViewPictureResponse = new ListManipulatorView([], 'H', RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h,
                25, 50, pictureResponseSize, pictureResponseSize, 8, undefined, MARGIN + 25);

            this.picResponses = true;
            this.listViewPictureResponse.position(0, RIGHTBOX_SIZE.header.h);
            picAddImageManip.add(picAddImage);
            picAddImageManip.addEvent('click', _createPopUpPicture);
            picAddImageManip.mark('picAddImageResponseManip');
            this.listViewPictureResponse.add(picAddImageManip);
            this.getImages().then((images) => {
                images.images.forEach(ele => {
                    let picManip = new Manipulator(this);
                    let pic = new svg.Image(ele.imgSrc)
                        .dimension(pictureResponseSize, pictureResponseSize);
                    pic.type = 'picture';
                    picManip.add(pic);
                    pic.onMouseDown(() => {
                        this.selectElement(pic);
                        this.selectedElement.response = true;
                    });
                    this.listViewPictureResponse.add(picManip);

                    // pic.onMouseDown(() => createDraggableCopy(pic));
                    pic.mark('img_' + ele._id);
                });
                this.listViewPictureResponse.refreshListView();
            });

            this.responsesPictureInput = new gui.TextField(0, 0, 2 / 3 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black])
            this.responsesPictureInput.font(FONT, 18);
            this.responsesPictureInput.position(-RIGHTBOX_SIZE.w / 2 + this.responsesPictureInput.width / 2 + MARGIN,
                this.listViewPictureResponse.height + RIGHTBOX_SIZE.header.h)
            this.responsesPictureInput.frame.corners(5, 5);

            this.responsesPictureInput.onClick(() => {
                this.selectCurrentInput = this.responsesPictureInput;
                this.selectCurrentInputHandler = addResponsePictureHandler;
            });
            // responsesPictureInput.glass.mark('responsesInputClick');
            // responsesPictureInput.mark('responsesInput');
            this.imageResponsesAddButton = new gui.Button(0.25 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h,
                [myColors.customBlue, 1, myColors.grey], 'Ajouter');
            this.imageResponsesAddButton.text
                .font(FONT, 18)
                .position(0, 6);
            this.imageResponsesAddButton.back.corners(5, 5);
            this.imageResponsesAddButton.position(RIGHTBOX_SIZE.w / 2 - MARGIN - this.imageResponsesAddButton.width / 2,
                this.listViewPictureResponse.height + RIGHTBOX_SIZE.header.h);
            this.imageResponsesAddButton.onClick(addResponsePictureHandler);
            this.responsesList = new ListManipulatorView(responses, 'V', LIST_SIZE.w,
                0.4 * RIGHTBOX_SIZE.h,
                75, 25, RIGHTBOX_SIZE.w - 2 * MARGIN, 27, 5);
            this.responsesList.position(0,
                this.responsesList.height + this.listViewPictureResponse.height + this.responsesPictureInput.height);
            this.responsesList.refreshListView();

            responsesManip
                .add(this.listViewPictureResponse.manipulator)
                .add(this.responsesPictureInput.component)
                .add(this.imageResponsesAddButton.component)
                .add(this.responsesList.manipulator)
        }

        display() {
            let _updateConsts = () => {
                PANEL_SIZE = {w: drawing.width - 2 * MARGIN, h: drawing.height * 0.7};
                SANDBOX_SIZE = {
                    w: PANEL_SIZE.w * 6 / 9,
                    h: PANEL_SIZE.h - 4 * MARGIN,
                    header: {w: PANEL_SIZE.w * 6 / 9, h: 100}
                };
                RIGHTBOX_SIZE = {
                    w: PANEL_SIZE.w - SANDBOX_SIZE.w - 3 * MARGIN, h: (PANEL_SIZE.h - 6 * MARGIN) / 2,
                    header: {w: PANEL_SIZE.w - SANDBOX_SIZE.w, h: 0.2 * (PANEL_SIZE.h - 5 * MARGIN) / 2}
                };
                LIST_SIZE = {
                    w: RIGHTBOX_SIZE.w - 2 * MARGIN,
                    h: RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h - 0.8 * INPUT_SIZE.h - MARGIN * 4
                };
                TAB_SIZE = {w: 0.1 * PANEL_SIZE.w, h: 0.1 * PANEL_SIZE.h};
                HEADER_TILE = SANDBOX_SIZE.header.h - 2 * MARGIN;
            }

            _updateConsts();
            super.display();
            this.displayBackGround();
            this.displayHeader(this.getLabel());
            this.displayTitle();
            this.displayTabs();
            this.displayLeftMainPanel();
            this.displaySandBoxZone();
            this.displayButtons();
            svg.addGlobalEvent('keydown', (event) => this.keyDown.call(this, event));
        }

        displayBackGround(){
            let bgManip = new Manipulator();
            let bg = new svg.Rect(drawing.width, drawing.height).color(myColors.lightgrey);
            bgManip.add(bg)
                .move(drawing.width/2, drawing.height/2);
            this.manipulator.add(bgManip);
        }

        displayTitle() {
            let createReturnButton = () => {
                this.returnButtonManipulator = new Manipulator(this);
                this.returnButton = new gui.Button(INPUT_SIZE.w*2/3, INPUT_SIZE.h, [myColors.white, 1, myColors.grey],
                    'Retourner aux formations');
                this.returnButton.onClick(this.returnToOldPage.bind(this));
                this.returnButton.back.corners(5, 5);
                this.returnButton.text.font(FONT, 20).position(0, 6.6);
                this.returnButtonManipulator.add(this.returnButton.component)
                    .move(this.returnButton.width / 2 + MARGIN, this.header.height + this.returnButton.height / 2 + MARGIN);
                let chevron = new svg.Chevron(10, 20, 3, 'W').color(myColors.grey);
                chevron.position(-130, 0);
                this.returnButtonManipulator.add(chevron);
                this.manipulator.add(this.returnButtonManipulator);
            }
            let createTitle = () => {
                let titleManipulator = new Manipulator(this);
                let title = new svg.Text('Creer un exercice : ')
                    .font(FONT, 25).anchor('left')
                    .position(-INPUT_SIZE.w / 2, 10);
                let exerciseTitleInput = new gui.TextField(0, 0, INPUT_SIZE.w, INPUT_SIZE.h, this.getLabel())
                exerciseTitleInput.font(FONT, 15).color(myColors.grey);
                exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                exerciseTitleInput.control.placeHolder(this.getLabel());

                exerciseTitleInput.onInput((oldMessage, message, valid) => {
                    if (!message || !oldMessage) {
                        exerciseTitleInput.text.message(this.getLabel());
                    }
                    exerciseTitleInput.text.position(-INPUT_SIZE.w / 2 + MARGIN, 7.5);
                });
                exerciseTitleInput.color([myColors.lightgrey, 1, myColors.black])
                    .position(0, INPUT_SIZE.h)
                    .onClick( () => {
                        this.selectCurrentInput = exerciseTitleInput;
                        this.selectCurrentInputHandler = () => {
                            this.renameDoll(this.selectCurrentInput.text.getMessageText());
                            this.selectCurrentInput.hideControl();
                        };
                    });
                exerciseTitleInput.mark('titleLabelInput');
                exerciseTitleInput.glass.mark('titleLabelClick');
                titleManipulator.add(exerciseTitleInput.component)
                    .add(title);
                titleManipulator.move(this.returnButton.width + exerciseTitleInput.width/2 + 2*MARGIN,
                    this.header.height + MARGIN);
                let saveIcon = new svg.Image('../../images/save.png');
                titleManipulator.add(saveIcon);
                saveIcon
                    .dimension(25, 25)
                    .position(exerciseTitleInput.width / 2 + 12.5 + MARGIN, exerciseTitleInput.height)
                    .mark('saveNameButton');
                svg.addEvent(saveIcon, 'click', () => {
                    this.renameDoll(exerciseTitleInput.text.getMessageText());
                });
                this.manipulator.add(titleManipulator);
            }

            createReturnButton();
            createTitle();
        }

        displayButtons() {
            this.buttonsManipulator = new Manipulator(this);
            let saveButton = new gui.Button(INPUT_SIZE.w, INPUT_SIZE.h, [[43, 120, 228], 1, myColors.black], 'Sauvegarder');
            saveButton.onClick(this.saveDoll.bind(this));
            saveButton.glass.mark('saveButtonDoll');
            this.buttonsManipulator.add(saveButton.component);
            this.buttonsManipulator.move(drawing.width - saveButton.width/2 - MARGIN, this.header.height + saveButton.height/2)
            this.manipulator.add(this.buttonsManipulator);
        }

        displayTabs(){
            let sizeTabW = LEFT_PANEL_SIZE/2 - MARGIN;

            let statement = new svg.Rect(sizeTabW, TAB_SIZE.h)
                .color(myColors.customBlue, 0, myColors.grey)
            let statementText = new svg.Text('Enoncé')
                .font(FONT, 18)
                .position(-statement.width/2 + MARGIN/2, 6)
                .anchor('left')
            statement.mark('statement');

            let rules = new svg.Rect(sizeTabW, TAB_SIZE.h)
                .color(myColors.white, 0, myColors.grey)
                .position(LEFT_PANEL_SIZE - sizeTabW, 0)
            let rulesText = new svg.Text('Règles')
                .font(FONT, 18)
                .position(rules.x - rules.width/2 + MARGIN/2, 6)
                .anchor('left')
            rules.mark('rules');

            resizeStringForText(statementText, sizeTabW, TAB_SIZE.h);
            resizeStringForText(rulesText, sizeTabW, TAB_SIZE.h);
            svg.addEvent(statement, 'click', () => {
                this.toggleTabs(false)
                statement.color(myColors.customBlue, 0, myColors.grey);
                rules.color(myColors.white, 0, myColors.grey);
            })
            svg.addEvent(statementText, 'click', () => {
                this.toggleTabs(false)
                statement.color(myColors.customBlue, 0, myColors.grey);
                rules.color(myColors.white, 0, myColors.grey);
            })
            svg.addEvent(rules, 'click', () => {
                this.toggleTabs(true)
                statement.color(myColors.white, 0, myColors.grey);
                rules.color(myColors.customBlue, 0, myColors.grey);
            })
            svg.addEvent(rulesText, 'click', () => {
                this.toggleTabs(true)
                statement.color(myColors.white, 0, myColors.grey);
                rules.color(myColors.customBlue, 0, myColors.grey);
            })


            let tabsManip = new Manipulator(this);
            tabsManip.add(statement)
                .add(statementText)
                .add(rules)
                .add(rulesText);
            tabsManip.move(MARGIN + sizeTabW/2,this.header.height + INPUT_SIZE.h*2 + TAB_SIZE.h/2);
            this.manipulator.add(tabsManip);
        }

        displayLeftMainPanel() {
            this.leftMainPanelManipulator = new Manipulator(this);
            let backRect = new svg.Rect(LEFT_PANEL_SIZE, drawing.height - this.header.height - INPUT_SIZE.h*2 - TAB_SIZE.h - MARGIN)
                .color(myColors.white, 0, myColors.grey)
            this.leftMainPanelManipulator.add(backRect)
                .move(backRect.width/2 + MARGIN,
                    backRect.height/2 + 3*MARGIN + this.header.height + INPUT_SIZE.h + TAB_SIZE.h)
            this.manipulator.add(this.leftMainPanelManipulator);

            if (this.rulesDisplay) {
                //this.displaySolutionsHeader();
            }
            else {
                this.displayObjectives();
                //this.displaySandBoxZone();
            }
        }

        displaySandBoxZone() {
            this.sandboxManip = new Manipulator(this);

            let actionList = new ListManipulatorView(this.actionTabs, 'H', drawing.width - LEFT_PANEL_SIZE - MARGIN*3, INPUT_SIZE.h*2, 25, 25, HEADER_TILE,
                HEADER_TILE, 0, undefined, 8);

            this.sandboxMain = new gui.Panel(actionList.width,
                drawing.height - this.header.height - INPUT_SIZE.h*2 - actionList.height - MARGIN, myColors.white);
            this.sandboxMain.border.color(myColors.none, 0, myColors.black);

            actionList.position(0, -this.sandboxMain.height/2 - actionList.height/2);
            this.sandboxManip.add(this.sandboxMain.component)
                .add(actionList.manipulator)
            this.sandboxMain.component.mark('mainPanel');

            svg.addEvent(this.sandboxMain.component, 'click', (event) => {
                this.selectElement(null);
                this.removeContextMenu()
            });

            this.sandboxManip.move(actionList.width/2 + LEFT_PANEL_SIZE + MARGIN*2, (this.sandboxMain.height)/2+ actionList.height
                + 3*MARGIN + this.header.height + INPUT_SIZE.h);
            this.manipulator.add(this.sandboxManip);
            actionList.refreshListView();
            this.elements.forEach((elem) => {
                this.sandboxMain.content.add(elem.parentManip.component);
                if (elem instanceof gui.TextField){
                    resizeStringForText(elem.text, elem.width, elem.height);
                }
            });
        }

        displayObjectives() {
            let createMiniature = (objective) => {
                let miniature = {
                    border: new svg.Line(-LIST_SIZE.w / 2 + 2 * MARGIN, 15, LIST_SIZE.w / 2 - 2 * MARGIN, 15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(objective.label).font(FONT, 18).position(0, 6),
                    manip: new Manipulator(this).mark(objective.label + 'Manip')
                };
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                miniature.manip.text = miniature.text;
                miniature.text.markDropID('objectivesDrop');
                miniature.border.markDropID('objectivesDrop');
                let conf = {
                    drop: (what, whatParent, finalX, finalY) => {
                        let point = whatParent.globalPoint(finalX, finalY);
                        let target = this.manipulator.last.getTarget(point.x, point.y);
                        if (!target || target && target.dropID != 'objectivesDrop' || !target.dropID) {
                            this.objectivesList.removeElementFromList(what);
                            this.removeObjective(what.text.messageText);
                            this.objectivesSelectList && this.objectivesSelectList.removeElementByText(what.text.messageText);
                            what.flush();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what) => {
                        this.objectivesList.resetAllMove();
                        this.objectivesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let addObjectiveHandler = () => {
                let newObjective = {label:this.objectivesInput.textMessage} //TODO id
                let mini = createMiniature(newObjective);
                if (mini.text.messageText == '') {
                    let errorMsg = new svg.Text('Veuiller entrer un texte');
                    errorMsg.position(-RIGHTBOX_SIZE.w / 2 + 2 * MARGIN, RIGHTBOX_SIZE.header.h + 6)
                        .anchor('left')
                        .font(FONT, 18)
                        .color(myColors.red);
                    resizeStringForText(errorMsg, this.objectivesInput.width, this.objectivesInput.height);
                    objectivesManip.add(errorMsg);

                    svg.timeout(() => {
                        objectivesManip.remove(errorMsg);
                    }, 3000);
                }
                else {
                    this.objectivesList.add(mini.manip);
                    this.objectivesList.refreshListView();
                    this.objectivesSelectList && this.objectivesSelectList.addElementByText(mini.text.messageText);
                    this.addObjective(mini.text.messageText);
                    this.objectivesInput.message('');
                }

            }

            let objectivesManip = new Manipulator(this);
            let objectivesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2, 2);
            let objectivesTitle = new svg.Text('Définissez les objectifs : ')
                .font(FONT, 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w / 2 + 2 * MARGIN, 8.33);
            resizeStringForText(objectivesTitle, RIGHTBOX_SIZE.w - 3 * MARGIN, 15);
            let objectivesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2, 2);
            objectivesBody.position(0, objectivesHeader.height / 2 + objectivesBody.height / 2);
            this.objectivesInput = new gui.TextField(0, 0, 2 / 3 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black]);

            this.objectivesInput.onClick( () => {
                this.selectCurrentInput = this.objectivesInput;
                this.selectCurrentInputHandler = addObjectiveHandler;
            });

            this.objectivesInput.font(FONT, 18);
            this.objectivesInput.position(-RIGHTBOX_SIZE.w / 2 + this.objectivesInput.width / 2 + MARGIN, RIGHTBOX_SIZE.header.h)
            this.objectivesInput.frame.corners(5, 5);
            this.objectivesInput.glass.mark('objectivesInputClick');
            this.objectivesInput.mark('objectivesInput');
            let objectivesAddButton = new gui.Button(0.25 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey], 'Ajouter');
            objectivesAddButton.text
                .font(FONT, 18)
                .position(0, 6);
            objectivesAddButton.back.corners(5, 5);
            objectivesAddButton.position(RIGHTBOX_SIZE.w / 2 - MARGIN - objectivesAddButton.width / 2, RIGHTBOX_SIZE.header.h);
            objectivesAddButton.onClick(addObjectiveHandler);

            let objectives = this.getObjectives().map(elem=>{return createMiniature(elem).manip});
            this.objectivesList = new ListManipulatorView(objectives, 'V', LIST_SIZE.w, LIST_SIZE.h, 75, 25, RIGHTBOX_SIZE.w - 2 * MARGIN, 27, 5);
            this.objectivesList.position(0, this.objectivesList.height / 2 + objectivesHeader.height / 2 + objectivesAddButton.height + 2 * MARGIN);
            this.objectivesList.markDropID('objectivesDrop')
            objectivesManip.add(objectivesHeader)
                .add(objectivesTitle)
                .add(objectivesBody)
                .add(objectivesAddButton.component)
                .add(this.objectivesInput.component)
                .add(this.objectivesList.manipulator);
            objectivesManip.move(PANEL_SIZE.w / 2 - RIGHTBOX_SIZE.w / 2 - MARGIN, 2 * MARGIN - PANEL_SIZE.h / 2 + objectivesHeader.height / 2);
            this.leftMainPanelManipulator.add(objectivesManip);
            this.objectivesList.refreshListView();
        }

        addObjective(obj){
            this.presenter.addObjective(obj);
        }
        removeObjective(obj){
            this.presenter.removeObjective(obj);
            let index = this.objectives.findIndex((elem)=>elem.label == obj);
            if(index !==-1) this.objectives.splice(index, 1);
        }

        displayResponses() {
            let createMiniature = (response)=>{
                let miniature = {
                    border: new svg.Line(-LIST_SIZE.w / 2 + 2 * MARGIN, 15, LIST_SIZE.w / 2 - 2 * MARGIN, 15)
                        .color(myColors.black, 1, myColors.grey),
                    text: new svg.Text(response.label).font(FONT, 18).position(0, 6),
                    manip: new Manipulator(this).mark(response.label + 'Manip'),
                    image: response.selectedSrc
                };
                miniature.manip.text = miniature.text;
                miniature.manip.add(miniature.text)
                    .add(miniature.border);
                if (miniature.image) {
                    let picImage = new svg.Image(miniature.image).dimension(27, 20),
                        picImageManip = new Manipulator(this);
                    picImageManip.add(picImage);
                    picImageManip.move(-LIST_SIZE.w/2 + picImage.width,0);
                    miniature.manip.add(picImageManip);
                }
                miniature.text.markDropID('responsesDrop');
                miniature.border.markDropID('responsesDrop');
                let conf = {
                    drop: (what, whatParent, finalX, finalY) => {
                        let point = whatParent.globalPoint(finalX, finalY);
                        let target = this.manipulator.last.getTarget(point.x, point.y);
                        if (!target || target && target.dropID != 'responsesDrop' || !target.dropID) {
                            this.responsesList.removeElementFromList(what);
                            this.removeResponse(what.text.messageText);
                            what.flush();
                        }
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what) => {
                        this.responsesList.resetAllMove();
                        this.responsesList.refreshListView();
                        return true;
                    }
                }
                installDnD(miniature.manip, drawings.component.glass.parent.manipulator.last, conf);
                return miniature;
            }
            let addResponseHandler = () => {
                let newResponse = {label:this.responsesInput.textMessage};
                let mini = createMiniature(newResponse);
                if (mini.text.messageText == '') {
                    let errorMsg = new svg.Text('Veuiller entrer un texte');
                    errorMsg.position(-RIGHTBOX_SIZE.w / 2 + 2 * MARGIN, RIGHTBOX_SIZE.header.h + 6)
                        .anchor('left')
                        .font(FONT, 18)
                        .color(myColors.red);
                    resizeStringForText(errorMsg, this.responsesInput.width, this.responsesInput.height);
                    responsesManip.add(errorMsg);

                    svg.timeout(() => {
                        responsesManip.remove(errorMsg);
                    }, 3000);
                }
                else {
                    this.responsesList.add(mini.manip);
                    this.responsesList.refreshListView();
                    this.responsesInput.message('');
                    this.addResponse(newResponse);
                    responses = this.getResponses().map(elem=>{return createMiniature(elem).manip});
                }
            }
            let _removeImgTab = () => {
                if (this.picResponses) {
                    responsesManip
                        .remove(this.listViewPictureResponse.manipulator)
                        .remove(this.responsesPictureInput.component)
                        .remove(this.imageResponsesAddButton.component)
                        .remove(this.responsesList.manipulator);
                } else {
                    responsesManip
                        .remove(this.responsesList.manipulator);
                }
            }
            let _removeTextTab = () => {
                responsesManip
                    .remove(responsesAddButton.component)
                    .remove(this.responsesInput.component)
                    .remove(this.responsesList.manipulator);
            }
            let _addTextTab = () => {
                responses = this.getResponses().map(elem=>{return createMiniature(elem).manip});
                this.responsesList = new ListManipulatorView(responses, 'V', LIST_SIZE.w, LIST_SIZE.h, 75, 25, RIGHTBOX_SIZE.w - 2 * MARGIN, 27, 5);
                this.responsesList.position(0, this.responsesList.height / 2 + responsesHeader.height / 2 + responsesAddButton.height + 2 * MARGIN);
                this.responsesList.markDropID('responsesDrop');
                responsesManip
                    .add(responsesAddButton.component)
                    .add(this.responsesInput.component)
                    .add(this.responsesList.manipulator);
                this.responsesList.refreshListView();
            }
            let _addImgTab = () => {
                this.displayPictureResponse(responsesManip, responses);
            }

            let responsesManip = new Manipulator(this);
            let responsesHeader = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h)
                .color(myColors.lightgrey, 1, myColors.grey)
                .corners(2, 2);
            let responsesTitle = new svg.Text('Définissez les réponses : ')
                .font(FONT, 20)
                .anchor('left')
                .position(-RIGHTBOX_SIZE.w / 2 + 2 * MARGIN, 8.33);
            resizeStringForText(responsesTitle, RIGHTBOX_SIZE.w - 3 * MARGIN, 15);
            let textResponseTab = new gui.Button(0.25*RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h, [myColors.white, 1, myColors.grey], 'Texte');
            textResponseTab.position(0.1 * RIGHTBOX_SIZE.w,0);
            textResponseTab.corners(2,2);
            textResponseTab.text.font(FONT, 18);
            textResponseTab.onClick(() => {
                _removeImgTab();
                _removeTextTab();
                _addTextTab();
            })
            let pictureResponseTab = new gui.Button(0.25*RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.header.h, [myColors.white, 1, myColors.grey], 'Image');
            pictureResponseTab.position(0.35 * RIGHTBOX_SIZE.w,0);
            pictureResponseTab.corners(2,2);
            pictureResponseTab.text.font(FONT, 18);
            pictureResponseTab.onClick(() => {
                _removeTextTab();
                _removeImgTab();
                _addImgTab();
            })
            let responsesBody = new svg.Rect(RIGHTBOX_SIZE.w, RIGHTBOX_SIZE.h - RIGHTBOX_SIZE.header.h)
                .color(myColors.white, 1, myColors.grey)
                .corners(2, 2);
            responsesBody.position(0, responsesHeader.height / 2 + responsesBody.height / 2);
            this.responsesInput = new gui.TextField(0, 0, 2 / 3 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h)
                .color([myColors.white, 1, myColors.black])
            this.responsesInput.font(FONT, 18);
            this.responsesInput.position(-RIGHTBOX_SIZE.w / 2 + this.responsesInput.width / 2 + MARGIN, RIGHTBOX_SIZE.header.h)
            this.responsesInput.frame.corners(5, 5);

            this.responsesInput.onClick( () => {
                this.selectCurrentInput = this.responsesInput;
                this.selectCurrentInputHandler = addResponseHandler;
            });
            this.responsesInput.glass.mark('responsesInputClick');
            this.responsesInput.mark('responsesInput');

            let responsesAddButton = new gui.Button(0.25 * RIGHTBOX_SIZE.w, 0.8 * INPUT_SIZE.h, [myColors.customBlue, 1, myColors.grey], 'Ajouter');
            responsesAddButton.text
                .font(FONT, 18)
                .position(0, 6);
            responsesAddButton.back.corners(5, 5);
            responsesAddButton.position(RIGHTBOX_SIZE.w / 2 - MARGIN - responsesAddButton.width / 2, RIGHTBOX_SIZE.header.h);
            responsesAddButton.onClick(addResponseHandler);

            let responses = this.getResponses().map(elem=>{return createMiniature(elem).manip});
            this.responsesList = new ListManipulatorView(responses, 'V', LIST_SIZE.w, LIST_SIZE.h, 75, 25, RIGHTBOX_SIZE.w - 2 * MARGIN, 27, 5);
            this.responsesList.position(0, this.responsesList.height / 2 + responsesHeader.height / 2 + responsesAddButton.height + 2 * MARGIN);
            this.responsesList.markDropID('responsesDrop');
            responsesManip.add(responsesHeader)
                .add(responsesTitle)
                .add(textResponseTab.component)
                .add(pictureResponseTab.component)
                .add(responsesBody)
                .add(responsesAddButton.component)
                .add(this.responsesInput.component)
                .add(this.responsesList.manipulator);
            responsesManip.move(PANEL_SIZE.w / 2 - RIGHTBOX_SIZE.w / 2 - MARGIN,
                2 * MARGIN - PANEL_SIZE.h / 2 + responsesHeader.height / 2 + RIGHTBOX_SIZE.h + 2 * MARGIN);
            this.leftMainPanelManipulator.add(responsesManip);
            this.responsesList.refreshListView();
        }

        addResponse(response){
            this.presenter.addResponse(response);
        }
        removeResponse(response){
            this.presenter.removeResponse(response);
            let index = this.responses.findIndex((resp)=>resp.label===response);
            if(index!==-1) this.responses.splice(index, 1);
        }

        loadBodyRules(bestList, acceptedList, sizeBlock){
            this.currentObjective.rules.bestSolutions.forEach((group,i)=>{
                let lastSolution;//Used to recreate parent/child link
                let count =0;
                group.forEach((resp, stat)=>{
                    let isChecked = count == Object.keys(group).length-1 ? false : true,
                        statement = stat,
                        response = resp;
                    let obj = {
                        labelToSelectResponse:response,
                        labelToSelectStatement:statement,
                        isChecked: isChecked,
                        groupId: i
                    }
                    let sol = this.createOneSolution(bestList.listSolution, sizeBlock.w, INPUT_SIZE.h,true, obj, lastSolution);
                    if(count>0){
                        sol.parentSolution = lastSolution;
                        lastSolution.childSolution = sol;
                    }
                    bestList.listSolution.add(sol);
                    lastSolution = sol;
                    count++;
                })
                bestList.listSolution.add(new Manipulator());
            })
            this.currentObjective.rules.acceptedSolutions.forEach((group,i)=>{
                let lastSolution;//Used to recreate parent/child link
                let count =0;
                group.forEach((resp, stat)=>{
                    let isChecked = count == Object.keys(group).length-1 ? false : true,
                        statement = stat,
                        response = resp;
                    let obj = {
                        labelToSelectResponse:response,
                        labelToSelectStatement:statement,
                        isChecked: isChecked,
                        groupId: i
                    }
                    let sol = this.createOneSolution(acceptedList.listSolution, sizeBlock.w, INPUT_SIZE.h,true, obj, lastSolution);
                    if(count>0){
                        sol.parentSolution = lastSolution;
                        lastSolution.childSolution = sol;
                    }
                    acceptedList.listSolution.add(sol);
                    lastSolution = sol;
                    count++;
                })
                acceptedList.listSolution.add(new Manipulator());
            })

            bestList.listSolution.refreshListView();
            acceptedList.listSolution.refreshListView();
        }

        displaySolutionsHeader() {
            var _clickListHandler = (newValue) => {
                this.currentObjective = this.objectives.find(elem=>{return elem.label == newValue});
                this.solutionsHeaderManipulator.add(this.createSolutionsBody());
            };
            var _createSolutionsHeader = () => {
                this.solutionsHeaderManipulator = new Manipulator(this).addOrdonator(4);
                let solutionsHeader = new svg.Rect(PANEL_SIZE.w, 0.2 * PANEL_SIZE.h)
                    .color(myColors.white, 1, myColors.grey)
                    .corners(2, 2);
                let headerTitle = new svg.Text('Pour chaque objectif créé, définir les règles associées : ')
                    .font(FONT, 18)
                    .anchor('left')
                    .position(-PANEL_SIZE.w / 2 + MARGIN, -solutionsHeader.height / 5)
                    .mark('headerTitle');

                let objectives = this.getObjectives().map((elem)=>{return elem.label});
                if(objectives.length == 0){
                    objectives.push('Veuillez ajouter au moins un objectif');
                }
                this.objectivesSelectList = new SelectItemList2(objectives, 0.6 * PANEL_SIZE.w, INPUT_SIZE.h);
                this.objectivesSelectList.mark('objectivesList');
                this.objectivesSelectList.setHandlerChangeValue(_clickListHandler);
                this.objectivesSelectList.setManipShowListAndPosition(this.solutionsHeaderManipulator);
                this.currentObjective = this.objectives.find(elem=>{return elem.label == this.objectivesSelectList.getSelectedButtonText()});
                this.solutionsHeaderManipulator.add(this.createSolutionsBody());

                this.solutionsHeaderManipulator
                    .add(solutionsHeader)
                    .add(headerTitle)
                    .add(this.objectivesSelectList.manipulator);
                this.solutionsHeaderManipulator.move(0,(solutionsHeader.height - PANEL_SIZE.h)/2);
            };

            !this.solutionsHeaderManipulator && _createSolutionsHeader();
            this.solutionsHeaderManipulator && this.leftMainPanelManipulator.add(this.solutionsHeaderManipulator);
            //this.solutionsHeaderManipulator && this.objectivesSelectList.resizeAllText();
        }

        createSolutionsBody(){
            var _createBlockSolution = (x, y, best) => {
                var createSolutionsList = () => {
                    let solutionBodyManip = new Manipulator(this);
                    solutionBodyManip.move(0, (0.2*PANEL_SIZE.h + sizeBody.h)/2);

                    let listSolution = new ListManipulatorView([], "V", sizeBlock.w, sizeBlock.h,
                        chevronSize.w, chevronSize.h, sizeBlock.w, INPUT_SIZE.h, 10, myColors.white, 10);
                    listSolution.position(x, y);

                    solutionBodyManip.add(listSolution.manipulator);

                    return {listSolution: listSolution, manipulator: solutionBodyManip};
                };

                let solutionBody = createSolutionsList();
                let title = new svg.Text(best ? "Solution optimale" : "Solution accepter")
                    .position(x, y - sizeBody.h/2)
                    .font(FONT, 20);
                let addSolutionButton = new gui.Button(INPUT_SIZE.w/1.5, INPUT_SIZE.h,
                    [myColors.white, 1, myColors.black], "Ajouter une solution");
                addSolutionButton.position(x, y - sizeBody.h/2 + addSolutionButton.height);
                addSolutionButton.onClick(() =>{
                    let solution = this.createOneSolution(solutionBody.listSolution, solutionBody.listSolution.width, INPUT_SIZE.h, best);
                    solution.spaceManip = new Manipulator(this);
                    //this.createRule(solution, best);
                    solutionBody.listSolution
                        .add(solution)
                        .add(solution.spaceManip);
                    solutionBody.listSolution.refreshListView();
                });
                if (best) {
                    addSolutionButton.glass.mark('newBestSolutionButton');
                } else {
                    addSolutionButton.glass.mark('newAcceptedSolutionButton');
                }
                solutionBody.manipulator
                    .add(addSolutionButton.component)
                    .add(title);

                return solutionBody;
            };

            let manipBlockSolutions = new Manipulator(this);

            let sizeBody = {w : PANEL_SIZE.w, h : 0.8*PANEL_SIZE.h};
            let chevronSize = {w: 70, h: 30};
            let sizeBlock = {w: sizeBody.w/3, h: sizeBody.h/2 + chevronSize.h*2};
            let blockBestSolution =  _createBlockSolution(-sizeBody.w/2 + sizeBlock.w/2 + MARGIN, (sizeBody.h - sizeBlock.h)/4, true);
            let blockNotOptimalSolution =  _createBlockSolution(sizeBody.w/2 - sizeBlock.w/2 - MARGIN, (sizeBody.h - sizeBlock.h)/4, false);
            this.currentObjective && this.loadBodyRules(blockBestSolution, blockNotOptimalSolution, sizeBlock);

            manipBlockSolutions
                .add(blockBestSolution.manipulator)
                .add(blockNotOptimalSolution.manipulator);

            return manipBlockSolutions;
        }
        createOneSolution(list, w, h, best, conf, parentManip) {

            let manipSelectItems = new Manipulator(this);
            let statementsLabels = this.getStatement().map(elem=>{return elem.id});
            let selectItemStatement = new SelectItemList2(statementsLabels, w/3, h);
            selectItemStatement
                .position(-w/2 + selectItemStatement.width/2 + MARGIN, 0)
                .setManipShowListAndPosition(list.manipulator);
            selectItemStatement.setDefaultLabel('Choisir');
            let responsesLabels = this.getResponses().map(elem=>{return elem.label});
            let selectItemResponse = new SelectItemList2(responsesLabels, w/3, h);
            selectItemResponse
                .position(-w/2 + selectItemResponse.width*1.5 + MARGIN*2, 0)
                .setManipShowListAndPosition(list.manipulator);
            selectItemResponse.setDefaultLabel('Choisir');
            this.createConditionAND(list, manipSelectItems, best, conf&&conf.isChecked,
                (parentManip) ? parentManip.conditionManipulator : undefined);
            conf && conf.labelToSelectStatement && selectItemStatement.setSelectButtonText(conf.labelToSelectStatement);
            conf && conf.labelToSelectResponse && selectItemResponse.setSelectButtonText(conf.labelToSelectResponse);
            manipSelectItems.statements = selectItemStatement;
            manipSelectItems.responses = selectItemResponse;
            manipSelectItems.groupId = conf && conf.groupId ? conf.groupId : best ? 'B' +Number(new Date()) : 'A' + Number(new Date());
            let handlerBeforeClick = ()=>{
                let possibleStatement = this.currentObjective.rules.findPossibleStatement(this.getStatement().map(elem=>{return elem.id}) , best, manipSelectItems.groupId);
                selectItemStatement.setElementsList(possibleStatement);
            }
            selectItemStatement.setHandlerBeforeClick(handlerBeforeClick);
            if (best) {
                selectItemStatement.onClickChangeValueHandler = (newChoice, oldChoice) => {
                    this.createRule(manipSelectItems, true, newChoice, oldChoice);
                }
                selectItemResponse.onClickChangeValueHandler = (newChoice, oldChoice) => {
                    this.createRule(manipSelectItems, true, newChoice, oldChoice);
                }
            }else{
                selectItemStatement.onClickChangeValueHandler = (newChoice, oldChoice) => {
                    this.createRule(manipSelectItems, false, newChoice, oldChoice);
                }
                selectItemResponse.onClickChangeValueHandler = (newChoice, oldChoice) => {
                    this.createRule(manipSelectItems, false, newChoice, oldChoice);
                }
            }
            manipSelectItems
                .add(manipSelectItems.conditionManipulator)
                .add(selectItemStatement.manipulator)
                .add(selectItemResponse.manipulator);

            return manipSelectItems;
        }

        createConditionAND(list, manipSelectItems, best, isChecked, parentConditionManip){
            manipSelectItems.conditionManipulator = new Manipulator(this).addOrdonator(4);

            var _removeSolutionChild = (list, childSolutionManip) => {
                if(childSolutionManip.childSolution){
                    _removeSolutionChild(list, childSolutionManip.childSolution);
                    childSolutionManip.childSolution = null;
                    list.removeElementFromList(childSolutionManip);
                    childSolutionManip.parentSolution.conditionManipulator.unset(1);
                }else{
                    childSolutionManip.parentSolution.conditionManipulator.unset(1);
                    childSolutionManip.parentSolution.childSolution = null;
                    list.removeElementFromList(childSolutionManip);
                    this.removeRule(childSolutionManip);
                }
            };

            var _toggleChecked = () => {
                if (icon.getStatus()) {
                    let newSolutions = this.createOneSolution(list, list.width, INPUT_SIZE.h, best, null, manipSelectItems);
                    list.addManipInIndex(newSolutions, list.getIndexByManip(manipSelectItems)+1);
                    list.refreshListView();
                    newSolutions.parentSolution = manipSelectItems;
                    manipSelectItems.childSolution = newSolutions;
                    newSolutions.groupId = manipSelectItems.groupId;
                    //this.createRule(newSolutions, best);
                } else {
                    _removeSolutionChild(list, manipSelectItems.childSolution);
                    list.refreshListView();
                }
            };


            let hideRect = new svg.Rect(60, list.getEleDim().h - MARGIN/2).color(myColors.white, 0 , myColors.white);
            let topLine = new svg.Rect(hideRect.width, hideRect.height).corners(5, 5);

            manipSelectItems.conditionManipulator.set(2, hideRect);
            manipSelectItems.conditionManipulator.set(0, topLine);

            let icon = IconCreator.createLockUnlockIcon(manipSelectItems.conditionManipulator, 3);
            icon.position(list.width/2 - icon.getSize() - MARGIN, list.getEleDim().h/2);

            hideRect.position(list.width/2 - icon.getSize() - hideRect.width/2 - MARGIN*1.3, list.getEleDim().h/2);
            topLine.position(list.width/2 - icon.getSize() - topLine.width/2 - MARGIN, list.getEleDim().h/2 - MARGIN/3);

            if(parentConditionManip){
                let downLine = new svg.Rect(hideRect.width, hideRect.height).corners(5, 5);
                downLine.position(list.width/2 - icon.getSize() - topLine.width/2 - MARGIN, list.getEleDim().h/2 + MARGIN/3);
                parentConditionManip.set(1, downLine);
            }

            icon.changeStatusHandler(_toggleChecked);
            if(isChecked){
                icon.activeStatusActionIcon();
            }
        }
        createRule(solution, best, newChoice, oldChoice){
            if (solution.statements.defaultLabel != solution.statements.getSelectedButtonText()
                && solution.responses.defaultLabel != solution.responses.getSelectedButtonText()) {
                let obj = {
                    newStatement: solution.statements.getSelectedButtonText(),
                    newResponse: solution.responses.getSelectedButtonText(),
                    groupId: solution.groupId,
                }
                if (newChoice == obj.newStatement) {
                    obj["oldStatement"] = oldChoice;
                } else if (newChoice == obj.newResponse) {
                    obj["oldResponse"] = oldChoice;
                }
                if(!this.currentObjective.rules.statementAlreadyInGroup(obj, best)) {
                    this.presenter.createRule(obj, this.currentObjective, best);
                }else{
                    popUp.display('Attention, une réponse par énoncé', this.manipulator);
                    solution.statements.setToDefault();
                }
            }
        }
        removeRule(manip){
            let obj = {
                statement : manip.statements.getSelectedButtonText(),
                response : manip.responses.getSelectedButtonText(),
                groupId : manip.groupId,
            }
            this.presenter.removeRule(obj, this.currentObjective);
        }

        //todo
        getStatement(){
            return this.presenter.getStatement();
        }


        selectElement(elem) {
            if(this.selectedElement){
                this.selectedElement.parentManip.corners && this.selectedElement.parentManip.corners.forEach(corner => {
                    corner.flush();
                });
                if(this.selectedElement.type === "picture" || this.selectedElement.type === "help"){
                    this.selectedElement.parentManip.remove(this.selectedElement.rectSelection);
                    this.selectedElement.response = false;
                }else if(this.selectedElement.type === 'text'){
                    this.selectedElement.color([this.selectedElement._colors[0], 1, myColors.grey]);
                }else if(this.selectedElement.type === 'rect'){
                    this.selectedElement.color(this.selectedElement.fillColor, 1, this.selectedElement.strokeColor);
                    this.selectedElement.parentManip.removeEvent('mousedown');
                };
            }

            if(elem){
                if (elem.type === "text") {
                    elem.color([elem._colors[0], 4, myColors.blue]);
                    elem.editColor([elem._colors[0], 4, myColors.blue]);
                } else if (elem.type === "picture" || elem.type === 'help') {
                    let rect = new svg.Rect(elem.width, elem.height).color(myColors.none, 1, myColors.black);
                    elem.parentManip.add(rect);
                    elem.rectSelection = rect;
                } else if(elem.type === 'rect') {
                    elem.color(elem.fillColor, 4, elem.strokeColor);
                    this.resizeElement(elem,elem.parentManip);
                    let conf = {
                        drag:(what,x,y)=>{
                            svgr.attr(drawing.component, 'style', 'cursor:all-scroll');
                            if(this.inModification && this.elementModified == elem){
                                this.rightMenu.posX.message(Math.round(elem.parentManip.x));
                                this.rightMenu.posY.message(Math.round(elem.parentManip.y));
                                this.rightMenu.sizeW.message(Math.round(elem.width));
                                this.rightMenu.sizeH.message(Math.round(elem.height));
                            }
                            return {x:x,y:y};
                        },
                        moved: () => {
                            svgr.attr(drawing.component, 'style', 'cursor:auto')
                        }
                    }
                    installDnD(elem.parentManip, this.sandboxMain.content, conf);
                }
            }
            this.selectedElement = elem;
        }

        resizeElement(elem, manipulator) {
            if (elem.rectSelection) {
                manipulator.remove(elem.rectSelection);
            }
            let initW = elem.width, initH = elem.height;
            let manipInitx = manipulator.x, manipInity = manipulator.y;
            let self = this;
            manipulator.corners = [];
            let br = function (x, y, Xcoeff, Ycoeff) {
                let delta = {x: x - this.x, y: y - this.y};
                if((initW + Xcoeff * delta.x) > 0 && (initH + Ycoeff * delta.y) > 0) {
                    elem.dimension(initW + Xcoeff * delta.x, initH + Ycoeff * delta.y)
                    elem.position(+delta.x / 2, +delta.y / 2);
                    if(elem.questionMark && elem.statementText){
                        elem.questionMark.position(+delta.x / 2, +delta.y / 2 + 1/3*elem.questionMark.fontSize);
                        elem.height<elem.width ? elem.questionMark.font(FONT, 0.75*elem.height) :  elem.questionMark.font(FONT, 0.75*elem.width);
                        elem.statementText.position(+delta.x / 2, +delta.y / 2 -elem.height/2 - 1.5*MARGIN)
                    }
                    let updateCorners = () => {
                        manipulator.corners.forEach(corner => {
                            corner.move(corner.point.getX() + delta.x / 2, corner.point.getY() + delta.y / 2);
                        });
                    }
                    if(self.inModification && elem == self.elementModified) {
                        self.rightMenu.posX.message(Math.round(elem.parentManip.x));
                        self.rightMenu.posY.message(Math.round(elem.parentManip.y));
                        self.rightMenu.sizeW.message(Math.round(elem.width));
                        self.rightMenu.sizeH.message(Math.round(elem.height));

                    }
                    updateCorners();
                    elem.refresh && elem.refresh();
                    if (elem instanceof gui.TextField){
                        elem.message(elem.textMessage);
                        resizeStringForText(elem.text, elem.width, elem.height);
                    }
                    return true;
                }
                return false;
            }
            let posArr = [
                {
                    x: -elem.width / 2, y: -elem.height / 2, id: 'topLeft', drag: function (x, y) {
                    return br.call(this, x, y, -1, -1)
                }, getX: function () {
                    return -elem.width / 2
                }, getY: function () {
                    return -elem.height / 2
                }
                },
                {
                    x: -elem.width / 2, y: +elem.height / 2, id: 'topRight', drag: function (x, y) {
                    return br.call(this, x, y, -1, 1)
                }, getX: function () {
                    return -elem.width / 2
                }, getY: function () {
                    return +elem.height / 2
                }
                },
                {
                    x: +elem.width / 2, y: -elem.height / 2, id: 'botLeft', drag: function (x, y) {
                    return br.call(this, x, y, 1, -1)
                }, getX: function () {
                    return +elem.width / 2
                }, getY: function () {
                    return -elem.height / 2
                }
                },
                {
                    x: +elem.width / 2, y: +elem.height / 2, id: 'botRight', drag: function (x, y) {
                    return br.call(this, x, y, 1, 1)
                }, getX: function () {
                    return +elem.width / 2
                }, getY: function () {
                    return +elem.height / 2
                }
                }
            ];
            let updatePoints = () => {
                for (let point of posArr) {
                    point.x = point.getX();
                    point.y = point.getY();
                }
            }
            for (let point of posArr) {
                let rect = new svg.Rect(10, 10).color(myColors.lightgrey, 1, myColors.grey);
                let manip = new Manipulator(this);
                manip.add(rect)
                let conf = {
                    drag: (what, x, y) => {
                        if(point.drag.call(point, x, y)) {
                            return {x: x, y: y};
                        }else {
                            return {x:what.x, y:what.y};
                        }
                    },
                    drop: (what, whatParent, finalX, finalY) => {
                        manipInitx = manipulator.x;
                        manipInity = manipulator.y;
                        elem.position(0, 0);
                        if(elem.questionMark && elem.statementText){
                            elem.questionMark.position(0,1/3*elem.questionMark.fontSize);
                            elem.statementText.position(0,-elem.height/2 - 1.5*MARGIN)
                        }
                        manipulator.move(manipInitx - (point.x - finalX) / 2, manipInity - (point.y - finalY) / 2);
                        manipulator.corners.forEach(corner => {
                            if (point.x != corner.point.x || point.y != corner.point.y) {
                                corner.move(corner.point.getX(), corner.point.getY())
                            }
                        });
                        updatePoints();
                        return {x: finalX, y: finalY, parent: whatParent};
                    },
                    moved: (what) => {

                    },
                    revert: (item) => {
                        item.move(point.getX(), point.getY());
                    }
                }
                installDnD(manip, drawings.component.glass.parent.manipulator.last, conf)
                manip.move(point.x, point.y);
                manip.mark(point.id);
                manip.point = point;
                manipulator.corners.push(manip);
                manipulator.add(manip.component);
            }
        }

        textZoning(event) {
            let point = this.sandboxMain.content.localPoint(event.x, event.y);
            let rect = new svg.Rect(0, 0).position(point.x, point.y).color(myColors.white, 1, myColors.black);
            this.sandboxMain.content.add(rect);
            let moveHandler = (eventMove) => {
                if (eventMove.x - event.x > 0 && eventMove.y - event.y > 0 && this.actionModes.currentMode == 'text') {
                    rect.dimension(eventMove.x - event.x, eventMove.y - event.y);
                    rect.position(point.x + rect.width / 2, point.y + rect.height / 2);
                }
            }
            let mouseupHandler = (eventUp) => {
                if (eventUp.x - event.x == 0 && eventUp.y - event.y == 0) {
                    this.sandboxMain.content.remove(rect);
                }else {
                    svg.removeEvent(this.sandboxMain.component, 'mousemove');
                    this.sandboxMain.content.remove(rect);
                    let text = new gui.TextField(0, 0, rect.width, rect.height, '');
                    text.color([myColors.white, 1, myColors.grey]);
                    text.type = 'text';
                    let manip = new Manipulator(this);
                    manip.move(rect.x, rect.y);
                    manip.add(text.component);
                    text.parentManip = manip;
                    manip.childObject = text;
                    text.onClick(() => {
                        this.selectElement(text);
                    })
                    text.onRightClick((event)=>{
                        this.textRightClick(text, manip, event);
                        this.selectElement(text);
                    })
                    text.onInput((old, newm, valid)=>{
                        text.message(newm);
                        resizeStringForText(text.text, text.width, text.height);

                    })
                    this.elements.push(text);
                    text.glass.mark('textElement' + this.elements.length + 'click');
                    text.mark('textElement' + this.elements.length);
                    this.sandboxMain.content.add(manip.component);
                    this.actionModes.actions['none']();
                }
            }
            svg.addEvent(this.sandboxMain.component, 'mousemove', moveHandler)
            svg.addEvent(this.sandboxMain.component, 'mouseup', mouseupHandler)
        }

        textRightClick(text, manipulator, event) {
            let arr = [];
            let color = this._makeClickableItem('Couleur', () => {
                let colors = [[43, 120, 228],
                    [125, 122, 117],
                    [230, 122, 25],
                    [155, 222, 17],
                    [0, 0, 0],
                    [255, 255, 255],
                    [255, 20, 147]];
                for (let i = 0; i < colors.length; i++) {
                    let color = colors[i];
                    let man = new Manipulator(this);
                    let rec = new svg.Rect(CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h).corners(2, 2).color(color, 0.5, myColors.grey);
                    man.add(rec);
                    man.addEvent('click', () => {
                        text.color([color, 1, myColors.grey])
                        text.editColor([color, 1, myColors.grey])
                    });
                    colors[i] = man;
                }
                this.contextMenu.setList(colors);
            });
            let resize = this._makeClickableItem('Redimensionner', () => {
                this.resizeElement(text, manipulator);
                this.removeContextMenu();
            });
            color.mark('colorOption');
            resize.mark('resizeOption');
            arr.push(color, resize);
            arr = arr.concat(this._createDeepnessElement(manipulator));
            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V', 150, NB_ELEMENT_RIGHT_CLICK * CONTEXT_TILE_SIZE.h + CHEVRON_RCLICK_SIZE.h*2,
                CHEVRON_RCLICK_SIZE.w, CHEVRON_RCLICK_SIZE.h, CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width / 2 - MARGIN, event.y + this.contextMenu.height / 2 - MARGIN);
            this.contextMenu.border.corners(2, 2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        rectZoning(event) {
            let point = this.sandboxMain.content.localPoint(event.x, event.y);
            let rect = new svg.Rect(0, 0).position(point.x, point.y).color(myColors.white, 2, myColors.black);

            this.sandboxMain.content.add(rect);
            let moveHandler = (eventMove) => {
                if (eventMove.x - event.x > 0 && eventMove.y - event.y > 0 && this.actionModes.currentMode == 'rect') {
                    rect.dimension(eventMove.x - event.x, eventMove.y - event.y);
                    rect.position(point.x + rect.width / 2, point.y + rect.height / 2);
                }
            }
            let mouseupHandler = (eventUp) => {
                if (eventUp.x - event.x == 0 && eventUp.y - event.y == 0) {
                    this.sandboxMain.content.remove(rect);
                } else {
                    let manip = new Manipulator(this);
                    this.sandboxMain.content.add(manip.component);
                    manip.move(rect.x, rect.y);
                    rect.position(0, 0);
                    this.sandboxMain.content.remove(rect)
                    manip.add(rect);
                    this.elements.push(rect);
                    rect.mark('rectElement' + this.elements.length);
                    rect.type = 'rect';
                    manip.childObject = rect;
                    svg.removeEvent(this.sandboxMain.component, 'mousemove');
                    rect.color(myColors.blue, 2, myColors.black);
                    this._assignRectElementEvents(rect, manip);
                    this.actionModes.actions['none']();
                }
            }
            svg.addEvent(this.sandboxMain.component, 'mousemove', moveHandler)
            svg.addEvent(this.sandboxMain.component, 'mouseup', mouseupHandler)
        }

        rectRightClick(rect, manipulator, event) {
            let arr = [];
            let makeColors = (handler) => {
                let colors = [[43, 120, 228],
                    [125, 122, 117],
                    [230, 122, 25],
                    [155, 222, 17],
                    [0, 0, 0],
                    [255, 255, 255],
                    [255, 20, 147]];
                for (let i = 0; i < colors.length; i++) {
                    let color = colors[i];
                    let man = new Manipulator(this);
                    let rec = new svg.Rect(CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h).corners(2, 2)
                        .color(colors[i], 0.5, myColors.grey);
                    man.add(rec);
                    man.mark('color' + i);
                    man.first.color = '' + color;
                    man.addEvent('click', () => {
                        handler(color)
                    });
                    colors[i] = man;
                }
                return colors;
            }
            let color = this._makeClickableItem('Couleur', () => {
                this.contextMenu.setList(makeColors((color) => {
                    rect.color(color, rect.strokeWidth, rect.strokeColor)
                }));
            });
            let resize = this._makeClickableItem('Redimensionner', () => {
                this.resizeElement(rect, manipulator);
                this.removeContextMenu();
            });
            let edit = this._makeClickableItem('Modifier',()=>{this._rightMenuForRect(rect,manipulator)});
            color.mark('colorOption');
            resize.mark('resizeOption');
            edit.mark('editOption');
            arr.push(color, resize, edit);
            arr = arr.concat(this._createDeepnessElement(manipulator));

            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V', 150, NB_ELEMENT_RIGHT_CLICK * CONTEXT_TILE_SIZE.h + CHEVRON_RCLICK_SIZE.h*2,
                CHEVRON_RCLICK_SIZE.w, CHEVRON_RCLICK_SIZE.h, CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width / 2 - MARGIN, event.y + this.contextMenu.height / 2 - MARGIN);
            this.contextMenu.border.corners(2, 2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        _rightMenuForRect(rect, manipulator) {
            this.rightMenu = {};
            let makeColors = (handler) => {
                let colors = [[43, 120, 228],
                    [125, 122, 117],
                    [230, 122, 25],
                    [155, 222, 17],
                    [0, 0, 0],
                    [255, 255, 255],
                    [255, 20, 147]];
                for (let i = 0; i < colors.length; i++) {
                    let color = colors[i];
                    let man = new Manipulator(this);
                    let rec = new svg.Rect(CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h).corners(2, 2)
                        .color(colors[i], 0.5, myColors.grey);
                    man.add(rec);
                    man.mark('color' + i);
                    man.first.color = '' + color;
                    man.addEvent('click', () => {
                        handler(color)
                    });
                    colors[i] = man;
                }
                return colors;
            }
            this.inModification = true;
            this.elementModified = rect;
            let propertiesToSave = {
                position: {x: rect.x, y: rect.y},
                size: rect.boundingRect(),
                borderColor: rect.strokeColor,
                backgroundColor: rect.fillColor,
                opacity: rect._opacity
            }
            if (this.rightMenuManipulator) {
                this.manipulator.remove(this.rightMenuManipulator);
            }

            let textSize = 18;

            this.rightMenuManipulator = new Manipulator(this).addOrdonator(2);
            let rMenu = new svg.Rect(RIGHTBOX_SIZE.w + MARGIN * 2, this.height - this.header.height)
                .color(myColors.white, 1, myColors.black);
            rMenu.mark('rightMenu');
            this.rightMenuManipulator.set(0, rMenu);

            let pos = {x: rMenu.width / 15, y: rMenu.height / 8};

            let title = new svg.Text("Modifier Rectangle");
            title.position(0, -rMenu.height / 2 + pos.y).font(FONT, 30);

            let arrayText = ['Position', 'Taille', 'Bordure', 'Fond', 'Opacité'];
            arrayText.forEach((ele, index) => {
                let text = new svg.Text(ele);
                text.position(-rMenu.width / 2 + pos.x, -rMenu.height / 2 + pos.y * (index + 2))
                    .anchor('left').font(FONT, textSize);
                this.rightMenuManipulator.add(text);
            });

            //For position
            let dimInput = {w: pos.x * 3, h: 40};
            let displayErrorInput = () => {
                let text = new svg.Text('Veuillez entrer une valeur correcte (numérique)')
                    .font(FONT, 18)
                    .color(myColors.red)
                    .mark('errorInputMessage');
                text.position(title.x, title.y + 30);
                this.rightMenuManipulator.set(1, text);
                resizeStringForText(text, RIGHTBOX_SIZE.w, 100);
                svg.timeout(() => {
                    this.rightMenuManipulator.unset(1);
                }, 3000);
            }
            let posX = new svg.Text("X");
            posX.position(-rMenu.width / 2 + pos.x * 5, -rMenu.height / 2 + pos.y * (2)).anchor('left').font(FONT, textSize);
            let inputPosX = new gui.TextField(-rMenu.width / 2 + pos.x * 5 + textSize / 3 * 2 + dimInput.w / 2 + MARGIN, -rMenu.height / 2 + pos.y * (2) - textSize / 3,
                dimInput.w, dimInput.h).color([myColors.lightgrey, 1, myColors.black]);
            inputPosX.message(manipulator.x);
            inputPosX.onInput((oldMessage, newMessage, valid) => {
                if (newMessage.match(/^-?\d+(\.\d+)?$/)) {
                    manipulator.move(newMessage, manipulator.y);
                }
                else {
                    newMessage && displayErrorInput();
                }
            })
            inputPosX.mark('inputPosX')

            let posY = new svg.Text("Y");
            posY.position(-rMenu.width / 2 + pos.x * 10, -rMenu.height / 2 + pos.y * (2)).anchor('left').font(FONT, textSize);
            let inputPosY = new gui.TextField(-rMenu.width / 2 + pos.x * 10 + textSize / 3 * 2 + dimInput.w / 2 + MARGIN, -rMenu.height / 2 + pos.y * (2) - textSize / 3,
                dimInput.w, dimInput.h).color([myColors.lightgrey, 1, myColors.black]);
            inputPosY.message(manipulator.y);
            inputPosY.onInput((oldMessage, newMessage, valid) => {
                if (newMessage.match(/^-?\d+(\.\d+)?$/)) {
                    manipulator.move(manipulator.x, newMessage);
                }
                else {
                    newMessage && displayErrorInput();
                }
            })
            inputPosY.mark('inputPosY')
            //For Taille
            let inputSizeW = new gui.TextField(-rMenu.width / 2 + pos.x * 5 - textSize / 3 * 2 + dimInput.w / 2 + MARGIN, -rMenu.height / 2 + pos.y * (3) - textSize / 3,
                dimInput.w, dimInput.h).color([myColors.lightgrey, 1, myColors.black]);
            let inputSizeH = new gui.TextField(-rMenu.width / 2 + pos.x * 10 - textSize / 3 * 2 + dimInput.w / 2 + MARGIN, -rMenu.height / 2 + pos.y * (3) - textSize / 3,
                dimInput.w, dimInput.h).color([myColors.lightgrey, 1, myColors.black]);
            let resizeRect = (x = rect.width, y = rect.height, Xbool) => {
                if (rect.keepProportion) {
                    if (Xbool) {
                        let ratio = x / rect.width;
                        rect.dimension(x, ratio * y);
                        inputSizeH.message(Math.round(rect.height));
                    }
                    else {
                        let ratio = y / rect.height;
                        rect.dimension(x * ratio, y);
                        inputSizeW.message(Math.round(rect.width));
                    }
                }
                else {
                    rect.dimension(x, y);
                }
            }
            inputSizeW.mark('inputSizeW')
            inputSizeH.mark('inputSizeH')
            inputSizeW.message(Math.round(rect.boundingRect().width));
            inputSizeW.onInput((oldMessage, newMessage, valid) => {
                if (newMessage.match(/^-?\d+(\.\d+)?$/)) {
                    resizeRect(Number(newMessage), rect.boundingRect().height, true);
                } else {
                    newMessage && displayErrorInput();
                }
            })
            inputSizeH.message(Math.round(rect.boundingRect().height));
            inputSizeH.onInput((oldMessage, newMessage, valid) => {
                if (newMessage.match(/^-?\d+(\.\d+)?$/)) {
                    resizeRect(rect.boundingRect().width, Number(newMessage), false);
                } else {
                    newMessage && displayErrorInput();
                }
            })
            this.rightMenu.posX = inputPosX;
            this.rightMenu.posY = inputPosY;
            this.rightMenu.sizeW = inputSizeW;
            this.rightMenu.sizeH = inputSizeH;


            let keepProportionButton = new svg.Rect(20, 20).color(myColors.white, 1, myColors.black).mark('keepProportionButton');
            keepProportionButton.position(posX.x + keepProportionButton.width / 2, posX.y + 50);
            keepProportionButton.enableProportion = !rect.keepProportion;
            svg.addEvent(keepProportionButton, 'click', () => {
                if (!keepProportionButton.enableButton) {
                    let enableButton = new svg.Rect(keepProportionButton.width - 5, keepProportionButton.height - 5)
                        .color(myColors.black, 0, myColors.black)
                        .position(keepProportionButton.x, keepProportionButton.y);
                    keepProportionButton.enableButton = enableButton;
                    svg.addEvent(keepProportionButton.enableButton, 'click', keepProportionButton.component.listeners['click']);
                }
                if (keepProportionButton.enableProportion) {
                    keepProportionButton.enableProportion = false;
                    this.rightMenuManipulator.remove(keepProportionButton.enableButton);
                    rect.keepProportion = false;
                }
                else {
                    keepProportionButton.enableProportion = true;
                    this.rightMenuManipulator.add(keepProportionButton.enableButton);
                    rect.keepProportion = true;
                }
            })

            let keepProportionText = new svg.Text('Garder les proportions')
                .font(FONT, 18)
                .position(keepProportionButton.x + 20, keepProportionButton.y + 6)
                .anchor('left');

            let borderRect = new svg.Rect(40, 40).mark('borderColor');
            borderRect.color(rect.strokeColor, 1, myColors.black).position(-rMenu.width / 2 + pos.x * 5 + 20, -rMenu.height / 2 + pos.y * (4) - textSize / 3);

            let backgroundRect = new svg.Rect(40, 40).mark('backgroundColor');
            backgroundRect.color(rect.fillColor, 1, myColors.black).position(-rMenu.width / 2 + pos.x * 5 + 20, -rMenu.height / 2 + pos.y * (5) - textSize / 3);


            let gauge = new Helpers.Gauge(pos.x * 8, 35, 0, 1);
            gauge.position(-rMenu.width / 2 + pos.x * 5 + gauge.width / 2, -rMenu.height / 2 + pos.y * (6) - textSize / 3);
            gauge.onChangeValue((data) => {
                rect.opacity(data);
            });
            gauge.setIndicateurToValue(rect._opacity || 1);

            let changeColorHandler = (elementToRemove, border) => {
                let updateRects = () => {
                    backgroundRect.color(rect.fillColor, 1, myColors.black);
                    borderRect.color(rect.strokeColor, 1, myColors.black);
                }
                let colors = makeColors((color) => {
                    if (border) {
                        rect.color(rect.fillColor, rect.strokeWidth, color);
                    }
                    else {
                        rect.color(color, rect.strokeWidth, rect.strokeColor);
                    }
                    this.rightMenuManipulator.remove(elementToRemove.first);
                    // elementToRemove.flush();
                    updateRects();
                });
                return colors;
            }
            let colorManip = new Manipulator(this);
            let colorBackgroundSelection = new ListManipulatorView(changeColorHandler(colorManip, false),
                'V', 150, (NB_ELEMENT_RIGHT_CLICK + 1) * CONTEXT_TILE_SIZE.h, 75, 20, CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            let colorBorderSelection = new ListManipulatorView(changeColorHandler(colorManip, true),
                'V', 150, (NB_ELEMENT_RIGHT_CLICK + 1) * CONTEXT_TILE_SIZE.h, 75, 20, CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            colorBackgroundSelection.refreshListView();
            colorBorderSelection.refreshListView();
            colorBackgroundSelection.manipulator.move(backgroundRect.x + CONTEXT_TILE_SIZE.w / 2, backgroundRect.y);
            colorBorderSelection.manipulator.move(borderRect.x + CONTEXT_TILE_SIZE.w / 2, borderRect.y);


            svg.addEvent(borderRect, 'click', () => {
                this.rightMenuManipulator.add(colorManip);
                colorManip.add(colorBorderSelection.manipulator);
                colorManip.remove(colorBackgroundSelection.manipulator);
            });
            svg.addEvent(backgroundRect, 'click', () => {
                this.rightMenuManipulator.add(colorManip);
                colorManip.add(colorBackgroundSelection.manipulator);
                colorManip.remove(colorBorderSelection.manipulator);
            });


            let redCross = IconCreator.createRedCrossIcon(this.rightMenuManipulator);
            redCross.position(rMenu.width / 2 - redCross.getSize() - MARGIN, -rMenu.height / 2 + redCross.getSize() + MARGIN);
            redCross.addEvent('click', () => {
                this.manipulator.remove(this.rightMenuManipulator);
                this.rightMenu = {};
                this.inModification = false;
                this.elementModified = null;
            });

            this.rightMenuManipulator.add(title)
                .add(posX).add(inputPosX.component)
                .add(posY).add(inputPosY.component)
                .add(inputSizeW.component).add(inputSizeH.component)
                .add(borderRect).add(backgroundRect)
                .add(gauge.manipulator)
                .add(colorManip)
                .add(keepProportionButton)
                .add(keepProportionText);
            svg.event(keepProportionButton, 'click')

            this.rightMenuManipulator.move(this.width - rMenu.width / 2, rMenu.height / 2 + this.header.height);
            this.manipulator.add(this.rightMenuManipulator);
            this.removeContextMenu();
        }

        _assignRectElementEvents(rect, manip){
            svg.addEvent(rect, 'click', () => {
                this.selectElement(rect)
            });
            svg.addEvent(rect, 'contextmenu', (event) => {
                this.selectElement(rect);
                this.rectRightClick(rect, manip, event);
            });
        }

        imageRightClick(image, manipulator, event) {
            let arr = [];
            let resize = this._makeClickableItem('Redimensionner', () => {
                this.resizeElement(image, manipulator);
                this.removeContextMenu();
            });
            arr.push(resize)
            resize.mark('resizeOption');
            arr = arr.concat(this._createDeepnessElement(manipulator));

            this.contextMenu && this.manipulator.remove(this.contextMenu.manipulator);
            this.contextMenu = new ListManipulatorView(arr, 'V', 150, NB_ELEMENT_RIGHT_CLICK * CONTEXT_TILE_SIZE.h + CHEVRON_RCLICK_SIZE.h*2,
                CHEVRON_RCLICK_SIZE.w, CHEVRON_RCLICK_SIZE.h, CONTEXT_TILE_SIZE.w, CONTEXT_TILE_SIZE.h, 5, undefined, 0);
            this.contextMenu.position(event.x + this.contextMenu.width / 2 - MARGIN, event.y + this.contextMenu.height / 2 - MARGIN);
            this.contextMenu.border.corners(2, 2).color(myColors.white, 1, myColors.grey);
            this.manipulator.add(this.contextMenu.manipulator);
            this.contextMenu.refreshListView();
        }

        addHelpIcon(helpA, event){
            let confHelp = {
                drop: (what, whatParent, x, y) => {
                    let points = whatParent.globalPoint(x, y);
                    let target = this.sandboxManip.last.getTarget(points.x, points.y);

                    if (target && target == this.sandboxMain.back) {
                        let helpPanelManip = new Manipulator(this);
                        let helpRect = new svg.Rect(80,80).color(myColors.white, 2, myColors.black);
                        let helpText = new svg.Text("?").font(FONT, 45).position(0, 15)
                        helpRect.type = 'help';
                        helpText.type = 'help';
                        helpPanelManip.add(helpRect).add(helpText);

                        let localPoints = this.sandboxMain.content.localPoint(x, y);
                        helpPanelManip.move(localPoints.x, localPoints.y);

                        helpPanelManip.addEvent('click', (event) => {
                            this.selectElement(helpRect);
                            if (event.which == 3) {
                                this.rectRightClick(helpRect, helpPanelManip, event);
                            }
                        });
                        this.elements.push(helpRect);
                        this.sandboxMain.content.add(helpPanelManip.first);
                        helpPanelManip.childObject = helpRect;
                        helpRect.statementId = 'Enoncé' + this.getStatement().length;
                        this.addStatement({id:'Enoncé' + this.getStatement().length})
                        let txt = new svg.Text(helpRect.statementId).font(FONT, 20).position(0,-helpRect.height/2 - 1.5*MARGIN);
                        helpPanelManip.add(txt);
                        helpRect.statementText = txt;
                        helpRect.questionMark = helpText;
                        helpRect.mark(helpRect.statementId + 'ImgElement');
                        let conf = {
                            drag: (what, x ,y) => {
                                svgr.attr(drawing.component, 'style', 'cursor:all-scroll');
                                return {x: x, y: y};
                            },
                            drop: (what, whatParent, x, y) => {
                                return {x: x, y: y, parent: this.sandboxMain.content};
                            },
                            moved: () => {
                                svgr.attr(drawing.component, 'style', 'cursor:auto');
                                return true;
                            }
                        };
                        installDnD(helpPanelManip, drawings.component.glass.parent.manipulator.last, conf);
                    }
                    return {x: what.x, y: what.y, parent: whatParent};
                },
                moved: (what) => {
                    what.flush();
                    return true;
                }
            };

            let helpManip = new Manipulator(this).addOrdonator(1);
            let point = helpA.globalPoint(0, 0);
            helpManip.move(point.x, point.y);
            let helpCopy = helpA.duplicate(helpA);
            helpCopy.mark('helpTabCopy')
            helpManip.set(0, helpCopy);
            drawings.piste.add(helpManip);

            installDnD(helpManip, drawings.component.glass.parent.manipulator.last, confHelp);
            svg.event(drawings.component.glass, "mousedown", event);
        }
        addStatement(obj){
            this.presenter.addStatement(obj);
        }

        _makeClickableItem(message, handler) {
            let txt = new svg.Text(message).font(FONT, 18).position(0, 6);
            let rect = new svg.Rect(CONTEXT_TILE_SIZE.w + MARGIN, CONTEXT_TILE_SIZE.h).color(myColors.white, 0.5, myColors.none);
            let manip = new Manipulator(this);
            manip.add(rect).add(txt);
            manip.addEvent('mouseenter', () => {
                rect.color(myColors.blue, 0.5, myColors.grey)
            });
            manip.addEvent('mouseleave', () => {
                rect.color(myColors.white, 0.5, myColors.none)
            });
            manip.addEvent('click', handler);
            return manip;
        }

        keyDown(event) {
            if ((event.keyCode == 46) && !this.inModification) {
                if (this.selectedElement) {
                    if(this.selectedElement.type === 'text') this.selectedElement.hideControl();
                    this.sandboxMain.content.remove(this.selectedElement.parentManip.component)
                    this.elements.remove(this.selectedElement);
                    this.selectedElement = null;
                }
            } else if (event.keyCode == 13){
                if(this.selectCurrentInput && this.selectCurrentInput.controlShown)
                    this.selectCurrentInputHandler && this.selectCurrentInputHandler();

                if(!this.inModification) {    // enter keydown and no mods
                    if (this.selectedElement && this.selectedElement.type === "text"){
                        this.selectedElement.hideControl();
                        this.selectElement(null);
                    }
                }
            }
        }


        removeContextMenu() {
            if (this.contextMenu) {
                this.manipulator.remove(this.contextMenu.manipulator);
            }
        }

        getLabel() {
            return this.presenter.getLabel();
        }

        getElements() {
            return this.presenter.getElements();
        }

        getObjectives(){
            return this.presenter.getObjectives();
        }

        //todo
        getResponses(){
            return this.presenter.getResponses();
        }

        toggleTabs(bool) {
            /*if (this.rulesDisplay != bool) {
                this.rulesDisplay = bool;
                this.displayLeftMainPanel();
            }*/
        }

        uploadImageByFile(file, progressDisplay) {
            return this.presenter.uploadImageByFile(file, progressDisplay);
        }

        getImages() {
            return this.presenter.getImages();
        }

        saveDoll() {
            let obj = this.objectives.map(elem => {
                return {label: elem.label, rules: elem.rules}
            });
            this.presenter.save({
                label: this.getLabel(),
                elements: this.elements,
                objectives: obj,
                responses: this.responses,
            }).then((data) => {
                data.message && this.displayMessage(data.message);
            }).catch((error) => {
                this.displayWarningMessage(error);
            });
            // popUp.display('Des éléments ne sont pas choisis', this.manipulator);
        }

        renameDoll(label) {
            this.presenter.renameDoll(label);
        }

        displayMessage(message) {
            popUp.displayValidMessage(message, this.manipulator);
        }

        displayWarningMessage(message) {
            popUp.displayWarningMessage(message, this.manipulator);
        }

    }

    return DollAdminV;
}