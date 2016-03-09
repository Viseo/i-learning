/**
 * Created by qde3485 on 25/02/16.
 */

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
            bgColor: {r: 125, g: 122, b: 117}
        };
        var answer = new Answer(answerJSON);

        expect(answer.correct).toEqual(false);
        expect(answer.label).toEqual("My first answer is...");
        expect(answer.imageSrc).toEqual("../resource/pomme.jpg");
        expect(answer.rgbBordure).toEqual("rgb(155, 222, 17)");
        expect(answer.bgColor).toEqual("rgb(125, 122, 117)");
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

        answer.display(10, 10, 200, 50);
        expect(function () {answer.display(10, 10, 50, 50); }).toBeCalled();
    });
});