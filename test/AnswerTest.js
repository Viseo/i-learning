/**
 * Created by qde3485 on 25/02/16.
 */

paper=null;
describe('answer', function() {

    beforeEach(function (){
        paper=RaphaelMock(0,0,1500,1500);
    });
    it('should instantiate correctly my answer with label & no imageSrc', function() {

        var a={
            label:"My first answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        };
        var answer = new Answer(a);

        expect(answer.correct).toEqual(false);
        expect(answer.label).toEqual("My first answer is...");
        expect(answer.imageSrc).toEqual(null);
        expect(answer.rgbBordure).toEqual("rgb(155, 222, 17)");
        expect(answer.bgColor).toEqual("rgb(125, 122, 117)");
    });

    it('should instantiate correctly my answer with imageSrc & no label', function() {
        var answer = new Answer(null, "mypic.jpg", false, {r: 125, g: 122, b: 117}, {r: 155, g: 222, b: 17});

        expect(answer.correct).toEqual(false);
        expect(answer.label).toEqual(null);
        expect(answer.imageSrc).toEqual("mypic.jpg");
        expect(answer.rgbBordure).toEqual("rgb(125, 122, 117)");
        expect(answer.bgColor).toEqual("rgb(155, 222, 17)");
    });

    it('should set bordure & bgColor to "none" with NaN parameters', function () {
        var answer = new Answer(null, null, false, null, {r: true, g:200, b: 100});

        expect(answer.rgbBordure).toEqual("black");
        expect(answer.bgColor).toEqual("none");
    });

    it('should set bordure & bgColor to "none" with no/incomplete args', function () {
        var answer = new Answer(null, null, false, {r: 200});

        expect(answer.rgbBordure).toEqual("black");
        expect(answer.bgColor).toEqual("none");
    });

    it('should throw an error when display is used with NaN parameters', function () {
        var answer = new Answer(null, null, false, {r: 155, g: 222, b: 17});

        expect(function () { answer.display(true, 3, "zz", null); }).toThrow(new Error(NaN));
    });
});