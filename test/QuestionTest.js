/**
 * Created by ABO3476 on 29/02/2016.
 */

describe('question', function() {
    it('should instantiate correctly my question with answer (label & no imageSrc) & label & no imageSrc', function() {
        var tabAnswer = [];
        tabAnswer.push({label: "My first answer is...", imageSrc: null, bCorrect: false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}})

        var question = new Question("My question is...", null, tabAnswer, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

        expect(question.label).toEqual("My question is...");
        expect(question.imageSrc).toEqual(null);
        expect(question.tabAnswer.length).toEqual(tabAnswer.length);
        expect(question.tabAnswer[0].label).toEqual(tabAnswer[0].label);
        expect(question.rgbBordure).toEqual("rgb(100, 149, 237)");
        expect(question.bgColor).toEqual("rgb(240, 128, 128)");
    });

    it('should instantiate correctly my question with answer (label & no imageSrc) & no label & imageSrc', function() {
        var tabAnswer = [];
        tabAnswer.push({label: "My first answer is...", imageSrc: null, bCorrect: false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}})

        var question = new Question(null, "mypic.jpg", tabAnswer, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

        expect(question.label).toEqual(null);
        expect(question.imageSrc).toEqual("mypic.jpg");
        expect(question.tabAnswer.length).toEqual(tabAnswer.length);
        expect(question.tabAnswer[0].label).toEqual(tabAnswer[0].label);
        expect(question.rgbBordure).toEqual("rgb(100, 149, 237)");
        expect(question.bgColor).toEqual("rgb(240, 128, 128)");
    });

    it('should instantiate correctly my question with answer(no label & imageSrc) & no label & imageSrc', function() {
        var tabAnswer = [];
        tabAnswer.push({label: null, imageSrc: "mypic.jpg", bCorrect: false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}})

        var question = new Question(null,"mypic.jpg",tabAnswer, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

        expect(question.label).toEqual(null);
        expect(question.imageSrc).toEqual("mypic.jpg");
        expect(question.tabAnswer.length).toEqual(tabAnswer.length);
        expect(question.tabAnswer[0].label).toEqual(tabAnswer[0].label);
        expect(question.rgbBordure).toEqual("rgb(100, 149, 237)");
        expect(question.bgColor).toEqual("rgb(240, 128, 128)");
    });

    it('should instantiate correctly my question with answer(no label & imageSrc) & label & non imageSrc', function() {
        var tabAnswer = [];
        tabAnswer.push({label: null, imageSrc: "mypic.jpg", bCorrect: false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}})

        var question = new Question("My question is...",null,tabAnswer, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

        expect(question.label).toEqual("My question is...");
        expect(question.imageSrc).toEqual(null);
        expect(question.tabAnswer.length).toEqual(tabAnswer.length);
        expect(question.tabAnswer[0].label).toEqual(tabAnswer[0].label);
        expect(question.rgbBordure).toEqual("rgb(100, 149, 237)");
        expect(question.bgColor).toEqual("rgb(240, 128, 128)");
    });

    it('should set bordure & bgColor to "none" with NaN parameters', function () {
        var question = new Question(null, null, null, null, {r: true, g:120, b: 120});

        expect(question.rgbBordure).toEqual("none");
        expect(question.bgColor).toEqual("none");
    });

    it('should set bordure & bgColor to "none" with no/incomplete args', function () {
        var question = new Question(null, null, null,{r: 120});

        expect(question.rgbBordure).toEqual("none");
        expect(question.bgColor).toEqual("none");
    });

    it('should throw an error when display is used with NaN parameters', function () {
        var question = new Question(null, null, null, null, {r: 240, g: 128, b: 128});

        expect(function () { question.display(false, 1, "nonNumbre", null); }).toThrow(new Error(NaN));
    })
});
