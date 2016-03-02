/**
 * Created by qde3485 on 02/03/16.
 */

var paper;

describe('Display Element of Question and Answer', function () {
    beforeEach(function () {
        paper = new RaphaelMock(0, 0, 1500, 1500);
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
        expect(true).toBe(answer.content.attr("text").indexOf("\n") !== -1);
        expect(answer.bordure).toBeDefined();
    });

    it('should display a very complex text in multiple lines with word-breaker ("-")', function () {
        var answer = new Answer("Texte. INFINITE TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEXTE. DUDUDUDUDUDUDUDUDUDDUDUDUDUDUDDUDUDUDUDUDUDUDUDUDUDUDUDUDUDU", null, false, {r: 200, g:0, b:0});
        answer.display(20, 20, 100, 100);
        expect(true).toBe(answer.content.attr("text").indexOf("-\n") !== -1);
        expect(answer.bordure).toBeDefined();
    });

    it('should display an image with a perfect given size', function () {
        var answer = new Answer(null, "../resource/spectre.png", false);
        answer.display(20, 20, 350, 92);

        paper.i0.test("../resource/spectre.png", 20, 20, 350, 92);
    });
});