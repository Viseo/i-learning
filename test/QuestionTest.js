/**
 * Created by ABO3476 on 29/02/2016.
 */

describe('question', function() {
    it('should instantiate correctly my question with answer (label & no imageSrc) & label & no imageSrc', function() {
        var tabAnswer = [];
        tabAnswer.push({label: "My first answer is...", imageSrc: null, bCorrect: false, rgbBordure:{r: 155, g: 222, b: 17}, bgColor:{r: 125, g: 122, b: 117}})

        var question = new Question("My question is...", null, tabAnswer, 1, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

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

        var question = new Question(null, "mypic.jpg", tabAnswer, 1, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

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

        var question = new Question(null,"mypic.jpg",tabAnswer, 1, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

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

        var question = new Question("My question is...",null,tabAnswer, 1, {r: 100,g: 149,b: 237},{r: 240,g: 128,b: 128});

        expect(question.label).toEqual("My question is...");
        expect(question.imageSrc).toEqual(null);
        expect(question.tabAnswer.length).toEqual(tabAnswer.length);
        expect(question.tabAnswer[0].label).toEqual(tabAnswer[0].label);
        expect(question.rgbBordure).toEqual("rgb(100, 149, 237)");
        expect(question.bgColor).toEqual("rgb(240, 128, 128)");
    });

    it('should set bordure & bgColor to "none" with NaN parameters', function () {
        var question = new Question(null, null, null, null, null, {r: true, g:120, b: 120});

        expect(question.rgbBordure).toEqual("black");
        expect(question.bgColor).toEqual("none");
    });

    it('should set bordure & bgColor to "none" with no/incomplete args', function () {
        var question = new Question(null, null, null, null, {r: 120});

        expect(question.rgbBordure).toEqual("black");
        expect(question.bgColor).toEqual("none");
    });

    it('should throw an error when display is used with NaN parameters', function () {
        var question = new Question(null, null, null, null, null, {r: 240, g: 128, b: 128});

        expect(function () { question.display(false, 1, "nonNumbre", null); }).toThrow(new Error(NaN));
    });

    it('should display answers in 4 to 1 row',function(){
        var quizz = new Quizz(myQuizz);

        var startTabQuestionLength=quizz.tabQuestions.length;
        while(quizz.tabQuestions.length>(startTabQuestionLength-3))
        {
            quizz.tabQuestions.shift();
        }
        while(quizz.tabQuestions.length>4)
        {
            quizz.tabQuestions.pop();
        }
        expect(quizz.tabQuestions.length).toEqual(4);
        quizz.display(50,10,1200,1200);

        // Question : 4 rows

        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(4);
        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t3.test(625,248,"Quelle est la capitale de la Libye?");
        paper.r4.test(50,220,1150,56);
        paper.t9.test(188.125,334,"Malpoli");
        paper.r10.test(50,306,276.25,56);
        paper.t11.test(479.375,334,"Papoli");
        paper.r12.test(341.25,306,276.25,56);
        paper.t13.test(770.625,334,"Tropoli");
        paper.r14.test(632.5,306,276.25,56);
        paper.t15.test(1061.875,334,"Tripoli");
        paper.r16.test(923.75,306,276.25,56);

        quizz.nextQuestion();
        // Question : 3 rows

        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(3);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t9.test(188.125,334,"Malpoli");
        paper.r10.test(50,306,276.25,56);
        paper.t11.test(479.375,334,"Papoli");
        paper.r12.test(341.25,306,276.25,56);
        paper.t13.test(770.625,334,"Tropoli");
        paper.r14.test(632.5,306,276.25,56);
        paper.t15.test(1061.875,334,"Tripoli");
        paper.r16.test(923.75,306,276.25,56);
        paper.t18.test(625,248,"Un terrain où on n'a rien planté est une terre...");
        paper.r19.test(50,220,1150,56);
        paper.t24.test(236.66666666666666,334,"Stupide");
        paper.r25.test(50,306,373.3333333333333,56);
        paper.t26.test(625,334,"Inculte");
        paper.r27.test(438.3333333333333,306,373.3333333333333,56);
        paper.t28.test(1013.3333333333333,334,"Idiote");
        paper.r29.test(826.6666666666666,306,373.3333333333333,56);
        paper.t30.test(236.66666666666666,405,"Ignare");
        paper.r31.test(50,377,373.3333333333333,56);

        quizz.nextQuestion();
        // Question : 2 rows
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(2);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t9.test(188.125,334,"Malpoli");
        paper.r10.test(50,306,276.25,56);
        paper.t11.test(479.375,334,"Papoli");
        paper.r12.test(341.25,306,276.25,56);
        paper.t13.test(770.625,334,"Tropoli");
        paper.r14.test(632.5,306,276.25,56);
        paper.t15.test(1061.875,334,"Tripoli");
        paper.r16.test(923.75,306,276.25,56);
        paper.t24.test(236.66666666666666,334,"Stupide");
        paper.r25.test(50,306,373.3333333333333,56);
        paper.t26.test(625,334,"Inculte");
        paper.r27.test(438.3333333333333,306,373.3333333333333,56);
        paper.t28.test(1013.3333333333333,334,"Idiote");
        paper.r29.test(826.6666666666666,306,373.3333333333333,56);
        paper.t30.test(236.66666666666666,405,"Ignare");
        paper.r31.test(50,377,373.3333333333333,56);
        paper.t33.test(625,248,"Un galurin est un...");
        paper.r34.test(50,220,1150,56);
        paper.t39.test(333.75,334,"Manteau");
        paper.r40.test(50,306,567.5,56);
        paper.t41.test(916.25,334,"Chapeau");
        paper.r42.test(632.5,306,567.5,56);
        paper.t43.test(333.75,405,"Gâteau");
        paper.r44.test(50,377,567.5,56);
        paper.t45.test(916.25,405,"Château");
        paper.r46.test(632.5,377,567.5,56);

        quizz.nextQuestion();
        // Question : 1 row
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(1);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t9.test(188.125,334,"Malpoli");
        paper.r10.test(50,306,276.25,56);
        paper.t11.test(479.375,334,"Papoli");
        paper.r12.test(341.25,306,276.25,56);
        paper.t13.test(770.625,334,"Tropoli");
        paper.r14.test(632.5,306,276.25,56);
        paper.t15.test(1061.875,334,"Tripoli");
        paper.r16.test(923.75,306,276.25,56);
        paper.t24.test(236.66666666666666,334,"Stupide");
        paper.r25.test(50,306,373.3333333333333,56);
        paper.t26.test(625,334,"Inculte");
        paper.r27.test(438.3333333333333,306,373.3333333333333,56);
        paper.t28.test(1013.3333333333333,334,"Idiote");
        paper.r29.test(826.6666666666666,306,373.3333333333333,56);
        paper.t30.test(236.66666666666666,405,"Ignare");
        paper.r31.test(50,377,373.3333333333333,56);
        paper.t39.test(333.75,334,"Manteau");
        paper.r40.test(50,306,567.5,56);
        paper.t41.test(916.25,334,"Chapeau");
        paper.r42.test(632.5,306,567.5,56);
        paper.t43.test(333.75,405,"Gâteau");
        paper.r44.test(50,377,567.5,56);
        paper.t45.test(916.25,405,"Château");
        paper.r46.test(632.5,377,567.5,56);
        paper.t48.test(625,248,"Quelle est l'orthographe correcte de ce verbe?");
        paper.r49.test(50,220,1150,56);
        paper.t53.test(625,334,"Boïcotter");
        paper.r54.test(50,306,1150,56);
        paper.t55.test(625,405,"Boycotter");
        paper.r56.test(50,377,1150,56);
        paper.t57.test(625,476,"Boycoter");
        paper.r58.test(50,448,1150,56);
    });

});
