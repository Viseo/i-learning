/**
 * Created by qde3485 on 25/02/16.
 */

var imageController = ImageController(ImageRuntime);
paper=null;
describe('answer', function() {

    beforeEach(function (){
        paper=RaphaelMock(0,0,1500,1500);
    });
    it('should instantiate correctly my answer', function() {

        var answerJSON={
            label:"My first answer is...",
            imageSrc: "../resource/pomme.jpg",
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117},
            fontSize:20,
            font:"Courier New"
        };
        var answer = new Answer(answerJSON);

        expect(answer.correct).toEqual(false);
        expect(answer.label).toEqual("My first answer is...");
        expect(answer.imageSrc).toEqual("../resource/pomme.jpg");
        expect(answer.rgbBordure).toEqual("rgb(155, 222, 17)");
        expect(answer.bgColor).toEqual("rgb(125, 122, 117)");
        expect(answer.fontSize).toEqual(20);
        expect(answer.font).toEqual("Courier New");
    });

    it('should throw an error when display is used with NaN parameters', function () {
        var answerJSON={
            label:"My first answer is...",
            imageSrc: "../resource/pomme.jpg",
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        };
        var answer = new Answer(answerJSON);
        expect(function () { answer.display(true, 3, "zz", null); }).toThrow(new Error(NaN));
    });
    it('should display a text', function () {
        var answerJSON={
            label:"My first\n answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: null,
            bgColor: null
        };
        var answer = new Answer(answerJSON);

        expect(answer.imageLoaded).toEqual(true);
        answer.display(10, 10, 200, 50);
        fail();
    });

    it('should display a tittled image', function () {
        var answerJSON={
            label:"My first is...",
            imageSrc: "../resource/cerise.jpg",
            bCorrect: false,
            colorBordure: null,
            bgColor: null
        };
        var answer = new Answer(answerJSON);

        expect(answer.imageLoaded).toEqual(false);
        imageController.imageLoaded(answer.image.id, 200, 5);
        answer.display(10, 10, 200, 50);
        expect(answer.imageLoaded).toEqual(true);
    });

    it('should display an image', function () {
        var answerJSON={
            label: null,
            imageSrc: "../resource/cerise.jpg",
            bCorrect: false,
            colorBordure: null,
            bgColor: null
        };
        var answer = new Answer(answerJSON);

        expect(answer.imageLoaded).toEqual(false);
        imageController.imageLoaded(answer.image.id, 200, 5);
        answer.display(10, 10, 200, 50);
        expect(answer.imageLoaded).toEqual(true);
    });
});