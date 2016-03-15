/**
 * Created by ABO3476 on 29/02/2016.
 */

describe('question', function() {
    beforeEach(function (){
        paper=RaphaelMock(0,0,1500,1500);
    });


    it('should go through the quizz & print the logs', function() {
        var quizz = new Quizz(myQuizz);

        console.log = jasmine.createSpy("log");

        var startTabQuestionLength=quizz.tabQuestions.length;
        while(quizz.tabQuestions.length>(startTabQuestionLength-3)) {
            quizz.tabQuestions.shift();
        }
        while(quizz.tabQuestions.length>4) {
            quizz.tabQuestions.pop();
        }

        quizz.display(50,10,1200,1200);
        expect(quizz.currentQuestionIndex).toEqual(0);
        onClickMock(paper.t9, 0, 0);
        expect(console.log).toHaveBeenCalledWith("Mauvaise réponse!\n  Bonnes réponses: Tripoli\n");
        expect(quizz.currentQuestionIndex).toEqual(1);

        console.log = jasmine.createSpy("log");
        onClickMock(paper.r27, 0, 0);
        expect(console.log).toHaveBeenCalledWith("Bonne réponse!\n");
        expect(quizz.currentQuestionIndex).toEqual(2);

        onClickMock(paper.t43, 0, 0);
        expect(quizz.currentQuestionIndex).toEqual(3);
        
        console.log = jasmine.createSpy("log");
        onClickMock(paper.r54, 0, 0);
        expect(quizz.currentQuestionIndex).toEqual(3);
        expect(console.log).toHaveBeenCalledWith("Final score: " + quizz.score);
    });

    it('should display answers in 4 to 1 row',function(){
        var quizz = new Quizz(myQuizz);

        var startTabQuestionLength=quizz.tabQuestions.length;
        while(quizz.tabQuestions.length>(startTabQuestionLength-3)) {
            quizz.tabQuestions.shift();
        }
        while(quizz.tabQuestions.length>4) {
            quizz.tabQuestions.pop();
        }
        expect(quizz.tabQuestions.length).toEqual(4);
        quizz.display(50,10,1200,1200);

        // Question : 4 rows
        //console.log(paper);
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
