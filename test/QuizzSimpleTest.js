/**
 * Created by qde3485 on 25/02/16.
 */

describe('answer', function() {

    it('should instantiate correctly my answer with label & no imageSrc', function() {
        var answer = new Answer("My first answer is...", null, false, {r: 155, g: 222, b: 17}, {r: 125, g: 122, b: 117});

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

        expect(answer.rgbBordure).toEqual("none");
        expect(answer.bgColor).toEqual("none");
    });

    it('should set bordure & bgColor to "none" with no/incomplete args', function () {
        var answer = new Answer(null, null, false, {r: 200});

        expect(answer.rgbBordure).toEqual("none");
        expect(answer.bgColor).toEqual("none");
    });

    it('should throw an error when display is used with NaN parameters', function () {
        var answer = new Answer(null, null, false, {r: 155, g: 222, b: 17});

        expect(function () { answer.display(true, 3, "zz", null); }).toThrow(new Error(NaN));
    });

    it('should display a basic text', function () {
        var answer = new Answer("Texte", null, false, {r: 200, g:0, b:0});
        answer.display(20, 20, 100, 100);
        expect(answer.content.attr("text")).toEqual(answer.label);
        expect(answer.bordure).toBeDefined();
    });

    it('should display a long text in multiple lines', function () {
        var answer = new Answer("Texte. There is a lot of text. It's so long. It's close to be boring.", null, false, {r: 200, g:0, b:0});
        answer.display(20, 20, 100, 100);
        expect(true).toBe(answer.label.indexOf("\n") !== -1);
        expect(answer.bordure).toBeDefined();
    });

    it('should display a very complex text in multiple lines with word-breaker ("-")', function () {
        var answer = new Answer("Texte. INFINITE TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEXTE. DUDUDUDUDUDUDUDUDUDDUDUDUDUDUDDUDUDUDUDUDUDUDUDUDUDUDUDUDUDU", null, false, {r: 200, g:0, b:0});
        answer.display(20, 20, 100, 100);
        expect(true).toBe(answer.label.indexOf("-\n") !== -1);
        expect(answer.bordure).toBeDefined();
    });
});