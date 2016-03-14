/**
 * Created by ABL3483 on 02/03/2016.
 */
/*var paper=null;
var imageController = new ImageController(ImageRuntime);*/
describe('Quizz Test', function() {


    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);

    });

    it('should NOT increment the current question index',function() {

        var tmpQuizz=JSON.parse(JSON.stringify(myQuizz));
        var quizz=new Quizz(tmpQuizz);

        quizz.tabQuestions.shift();
        quizz.tabQuestions.shift();

        while (quizz.tabQuestions.length>2) {
            quizz.tabQuestions.pop();
        }


        quizz.display(50,10,1200,1200);
        console.log(quizz.tabQuestions.length);
        var tmp=quizz.currentQuestionIndex;

        var setLength=quizz.displaySet.length;
        var questionSet=quizz.displaySet[setLength-1];


        quizz.nextQuestion();
        expect(quizz.currentQuestionIndex).toEqual(tmp+1);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]).toBeDefined();


        expect(quizz.displaySet.length).toEqual(setLength);
        expect(quizz.displaySet[setLength-1]).not.toEqual(questionSet);
        console.log('hello');
        quizz.nextQuestion();
        console.log('goodbye');
        expect(quizz.tabQuestions[(quizz.currentQuestionIndex+1)]).toBeUndefined();
        expect(quizz.currentQuestionIndex).not.toEqual(tmp+2);

    });

    it("should display the first question (testing interface)",function(){

        var tmpQuizz=JSON.parse(JSON.stringify(myQuizz));// clone de myQuizz
        var quizz=new Quizz(tmpQuizz);

        console.log(quizz.tabQuestions.length);
        while (quizz.tabQuestions.length>1) {
            quizz.tabQuestions.pop();
        }

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);

        quizz.display(50, 10, 1200, 1200);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t3.test(625,1282,"Une divinité féminine est une...");
        paper.i4.test("../resource/millions.png",113,230,1024,1024);
        paper.r5.test(50,220,1150,1090);
        paper.t10.test(333.75,1368,"Comtesse");
        paper.r11.test(50,1340,567.5,56);
        paper.t12.test(916.25,1368,"Déesse");
        paper.r13.test(632.5,1340,567.5,56);
        paper.t14.test(333.75,1439,"Bougresse");
        paper.r15.test(50,1411,567.5,56);
        paper.t16.test(916.25,1439,"Diablesse");
        paper.r17.test(632.5,1411,567.5,56);


    });

    it('should display redimentionned images',function(){
        var myQuest = myQuizz.tabQuestions[1];
        var tmpQuizz = new Quizz(myQuizz);
        tmpQuizz.tabQuestions = [];
        tmpQuizz.tabQuestions.push(myQuest);
        var quizz = new Quizz(tmpQuizz);

        imageController.imageLoaded(quizz.tabQuestions[0].tabAnswer[0].image.id,925,1000 );
        imageController.imageLoaded(quizz.tabQuestions[0].tabAnswer[1].image.id,2835,2582 );

        quizz.display(50,10,1200,1200);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);

        paper.t3.test(625,248,"Parmi ces fruits, lequel possède un noyau?");
        paper.r4.test(50,220,1150,56);
        //image simple, pas de cadre
        paper.i8.test("../resource/pomme.jpg",50,305.99999999999994,567.5,613.5135135135134);
        paper.t9.test(916.25,891.5135135135134,"La cerise");

        paper.i10.test("../resource/cerise.jpg",642.5,340.43665093665084,547.5,498.6402116402116);
        paper.r11.test(632.5,306,567.5,613.5135135135134);
        paper.t12.test(333.75,1241.2702702702702,"La poire");
        paper.r13.test(50,934.5135135135134,567.5,613.5135135135134);
        paper.t14.test(916.25,1241.2702702702702,"L'orange");
        paper.r15.test(632.5,934.5135135135134,567.5,613.5135135135134);
        console.log(paper.r15);
        expect(paper.r15.fill).not.toEqual(paper.r11.fill);

    });

    it('should display the 4th satifaction level (worst score)',function(){
        //TODO: Devrait marcher quand on aura plus de chargement dans le display du puzzle !_!
        var quizz = new Quizz(myQuizz);

        var startTabQuestionLength=quizz.tabQuestions.length;

        while(quizz.tabQuestions.length>(startTabQuestionLength-3)){
            quizz.tabQuestions.shift();
        }
        while(quizz.tabQuestions.length>4){
            quizz.tabQuestions.pop();
        }
        console.log("shift&pop");
        //quizz.display(50,10,1200,1200);
        quizz.puzzleLines=3;
        quizz.puzzleRows=3;

        console.log("lines&rows");

        console.log('length: '+quizz.tabQuestions.length);
        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.nextQuestion();
        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t59.test(625,320,"Votre niveau est désolant... Mais gardez espoir !\nVous avez répondu à 14 questions, dont aucune n'est juste !");
        paper.r60.test(50,220,1150,200);
        paper.t61.test(236.66666666666666,530,"Quelle est la capitale de la Libye?");
        paper.r62.test(50,435,373.3333333333333,190);
        paper.t63.test(236.66666666666666,735,"Un terrain où on n'a rien planté\nest une terre...");
        paper.r64.test(50,640,373.3333333333333,190);
        paper.t65.test(236.66666666666666,940,"Un galurin est un...");
        paper.r66.test(50,845,373.3333333333333,190);
        paper.t67.test(625,530,"Quelle est l'orthographe correcte\nde ce verbe?");
        paper.r68.test(438.3333333333333,435,373.3333333333333,190);


    });

});

/*quizz.tabQuestions.forEach(function (e) {
 if(e.imageSrc) {
 imageController.imageLoaded(e.image.id, 350, 250);
 }
 e.tabAnswer.forEach(function (el) {
 if(el.imageSrc) {
 imageController.imageLoaded(el.image.id, 350, 250);
 }
 });
 });*/