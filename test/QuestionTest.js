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
        console.log = jasmine.createSpy("log");
        onClickMock(quizz.tabQuestions[quizz.currentQuestionIndex].tabAnswer[1].content, 0, 0); // Click d'une mauvaise réponse
        expect(console.log).toHaveBeenCalledWith("Mauvaise réponse!\n  Bonnes réponses: \nTripoli\n");
        expect(quizz.currentQuestionIndex).toEqual(1);

        console.log = jasmine.createSpy("log");
        onClickMock(quizz.tabQuestions[quizz.currentQuestionIndex].rightAnswers[0].content, 0, 0);
        expect(console.log).toHaveBeenCalledWith("Bonne réponse!\n");
        expect(quizz.currentQuestionIndex).toEqual(2);

        onClickMock(quizz.tabQuestions[quizz.currentQuestionIndex].rightAnswers[0].content, 0, 0);
        expect(quizz.currentQuestionIndex).toEqual(3);
        
        console.log = jasmine.createSpy("log");
        onClickMock(quizz.tabQuestions[quizz.currentQuestionIndex].rightAnswers[0].content, 0, 0);
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
        paper.t2.test(625,320,"Quelle est la capitale de la Libye?");
        paper.r3.test(50,220,1150,200);
        paper.t8.test(188.125,478,"Malpoli");
        paper.r9.test(50,450,276.25,56);
        paper.t10.test(479.375,478,"Papoli");
        paper.r11.test(341.25,450,276.25,56);
        paper.t12.test(770.625,478,"Tropoli");
        paper.r13.test(632.5,450,276.25,56);
        paper.t14.test(1061.875,478,"Tripoli");
        paper.r15.test(923.75,450,276.25,56);

        quizz.nextQuestion();
        // Question : 3 rows

        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(3);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t16.test(625,320,"Un terrain où on n'a rien planté est une terre...");
        paper.r17.test(50,220,1150,200);
        paper.t22.test(236.66666666666666,478,"Stupide");
        paper.r23.test(50,450,373.3333333333333,56);
        paper.t24.test(625,478,"Inculte");
        paper.r25.test(438.3333333333333,450,373.3333333333333,56);
        paper.t26.test(1013.3333333333333,478,"Idiote");
        paper.r27.test(826.6666666666666,450,373.3333333333333,56);
        paper.t28.test(236.66666666666666,549,"Ignare");
        paper.r29.test(50,521,373.3333333333333,56);

        quizz.nextQuestion();
        // Question : 2 rows
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(2);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t30.test(625,320,"Un galurin est un...");
        paper.r31.test(50,220,1150,200);
        paper.t36.test(333.75,478,"Manteau");
        paper.r37.test(50,450,567.5,56);
        paper.t38.test(916.25,478,"Chapeau");
        paper.r39.test(632.5,450,567.5,56);
        paper.t40.test(333.75,549,"Gâteau");
        paper.r41.test(50,521,567.5,56);
        paper.t42.test(916.25,549,"Château");
        paper.r43.test(632.5,521,567.5,56);

        quizz.nextQuestion();
        // Question : 1 row
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].rows).toEqual(1);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t44.test(625,320,"Quelle est l'orthographe correcte de ce verbe?");
        paper.r45.test(50,220,1150,200);
        paper.t49.test(625,478,"Boïcotter");
        paper.r50.test(50,450,1150,56);
        paper.t51.test(625,549,"Boycotter");
        paper.r52.test(50,521,1150,56);
        paper.t53.test(625,620,"Boycoter");
        paper.r54.test(50,592,1150,56);

    });
    it('should reset answers', function(){
        var tmpQuizz=JSON.parse(JSON.stringify(myQuizz));
        tmpQuizz.tabQuestions[0].tabAnswer[0].bCorrect = true;
        var quizz = new Quizz(tmpQuizz);
        quizz.display(50,10,1200,1200);
        // Click upon an answer and reset
        onClickMock(paper.t9, 0, 0);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].selectedAnswers.length).toEqual(1);
        onClickMock(paper.t19, 0, 0);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].selectedAnswers.length).toEqual(0);
        paper.t19.test(525,617,"Reset");
        paper.r20.test(450,592,150,50);
        // Click upon reset with no selected answer
        onClickMock(paper.t19, 0, 0);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].selectedAnswers.length).toEqual(0);
        // Click upon an answer twice
        onClickMock(paper.t9, 0, 0);
        onClickMock(paper.t9, 0, 0);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex].selectedAnswers.length).toEqual(0);
    });
});
