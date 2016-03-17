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
        paper.t2.test(625,392,"Une divinité féminine est une...");
        paper.i3.test("../resource/millions.png",558,230,134,134);
        paper.r4.test(50,220,1150,200);
        paper.t9.test(333.75,478,"Comtesse");
        paper.r10.test(50,450,567.5,56);
        paper.t11.test(916.25,478,"Déesse");
        paper.r12.test(632.5,450,567.5,56);
        paper.t13.test(333.75,549,"Bougresse");
        paper.r14.test(50,521,567.5,56);
        paper.t15.test(916.25,549,"Diablesse");
        paper.r16.test(632.5,521,567.5,56);


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
        paper.t2.test(625,320,"Parmi ces fruits, lequel possède un noyau?");
        paper.r3.test(50,220,1150,200);
        paper.i7.test("../resource/pomme.jpg",50,449.99999999999994,567.5,613.5135135135134);
        paper.t8.test(916.25,1035.5135135135133,"La cerise");
        paper.i9.test("../resource/cerise.jpg",642.5,484.43665093665084,547.5,498.6402116402116);
        paper.r10.test(632.5,450,567.5,613.5135135135134);
        paper.t11.test(333.75,1385.27027027027,"La poire");
        paper.r12.test(50,1078.5135135135133,567.5,613.5135135135134);
        paper.t13.test(916.25,1385.27027027027,"L'orange");
        paper.r14.test(632.5,1078.5135135135133,567.5,613.5135135135134);
        console.log(paper.r15);
        expect(paper.r10.fill).not.toEqual(paper.r12.fill);


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
        quizz.score=0;
        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.nextQuestion();
        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t55.test(625,320,"Votre niveau est désolant... Mais gardez espoir !\nVous avez répondu à 4 questions, dont aucune n'est juste !");
        paper.r56.test(50,220,1150,200);
        paper.t57.test(236.66666666666666,530,"Quelle est la capitale de la Libye?");
        paper.r58.test(50,435,373.3333333333333,190);
        paper.t59.test(236.66666666666666,735,"Un terrain où on n'a rien planté\nest une terre...");
        paper.r60.test(50,640,373.3333333333333,190);
        paper.t61.test(236.66666666666666,940,"Un galurin est un...");
        paper.r62.test(50,845,373.3333333333333,190);
        paper.t63.test(625,530,"Quelle est l'orthographe correcte\nde ce verbe?");
        paper.r64.test(438.3333333333333,435,373.3333333333333,190);


    });

    it('should display the 3rd satifaction level (all wrong except one)',function(){
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
        for(var i=0;i<quizz.tabQuestions.length-1;i++) {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }
        quizz.score=1;
        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.nextQuestion();
        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t55.test(625,320,"Vous avez encore de nombreux progrès à faire.\nVous avez répondu à 4 questions, dont une seule est juste.");
        paper.r56.test(50,220,1150,200);
        paper.t57.test(236.66666666666666,530,"Quelle est la capitale de la Libye?");
        paper.r58.test(50,435,373.3333333333333,190);
        paper.t59.test(236.66666666666666,735,"Un terrain où on n'a rien planté\nest une terre...");
        paper.r60.test(50,640,373.3333333333333,190);
        paper.t61.test(236.66666666666666,940,"Un galurin est un...");
        paper.r62.test(50,845,373.3333333333333,190);


    });

    it('should display the 2nd satifaction level (all good except one)',function(){
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
        for(var i=0;i<quizz.tabQuestions.length-3;i++) {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }
        quizz.score=3;
        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.nextQuestion();
        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t55.test(625,320,"Pas mal du tout !\nVous avez répondu à 4 questions,  et toutes (sauf une...) sont justes !");
        paper.r56.test(50,220,1150,200);
        paper.t57.test(236.66666666666666,530,"Quelle est la capitale de la Libye?");
        paper.r58.test(50,435,373.3333333333333,190);



    });

    it('should display the 1st satifaction level (best score)',function(){
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
        for(var i=0;i<quizz.tabQuestions.length-3;i++) {
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }
        quizz.score=4;
        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++) {
            quizz.nextQuestion();
        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t55.test(625,320,"Impressionant !\nVous avez répondu à 4 questions,  et toutes sont justes !");
        paper.r56.test(50,220,1150,200);


    });

    it('should display navigation arrows',function(){
        var quizz = new Quizz(myQuizz);
        for(var i=0;i<quizz.tabQuestions.length;i++){
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        console.log('Length: '+quizz.tabQuestions.length);
        quizz.puzzleLines=2;
        quizz.puzzleRows=3;

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[1].image.id,166,200);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[2].image.id,183,262);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[3].image.id,225,225);

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++){
            onClickMock(quizz.tabQuestions[i].tabAnswer[2].bordure);

        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Correct, mais ne relachez pas vos efforts !\nVous avez répondu à 14 questions,  dont 7 sont justes !");
        paper.r199.test(50,220,1150,200);
        paper.p200.test(65,735,60.00000000000004,32.00000000000002,"grey");
        paper.p201.test(1185,735,60.00000000000004,32.00000000000002,"black");
        paper.t202.test(280,690.5,"Une divinité féminine est\nune...");
        paper.i203.test("../resource/millions.png",175.75,445,208.5,208.5);
        paper.r204.test(115,435,330,292.5);
        paper.t205.test(280,888.75,"Parmi ces fruits, lequel\npossède un noyau?");
            paper.r206.test(115,742.5,330,292.5);
        paper.t207.test(625,581.25,"Traditionnellement, le\njustaucorps est porté par...");
        paper.r208.test(460,435,330,292.5);
        paper.t209.test(625,888.75,"Quelle est la capitale de la\nLibye?");
            paper.r210.test(460,742.5,330,292.5);
        paper.t211.test(970,581.25,"Un terrain où on n'a rien\nplanté est une terre...");
        paper.r212.test(805,435,330,292.5);
        paper.t213.test(970,888.75,"Un galurin est un...");
        paper.r214.test(805,742.5,330,292.5);

    });

    it('should shift wrong answers columns by blocks of 2(3 colums,1 line)',function(){
        var quizz = new Quizz(myQuizz);
        for(var i=0;i<quizz.tabQuestions.length;i++){
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        console.log('Length: '+quizz.tabQuestions.length);
        quizz.puzzleLines=1;
        quizz.puzzleRows=3;

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[1].image.id,166,200);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[2].image.id,183,262);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[3].image.id,225,225);

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++){
            onClickMock(quizz.tabQuestions[i].tabAnswer[2].bordure);

        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Correct, mais ne relachez pas vos efforts !\nVous avez répondu à 14 questions,  dont 7 sont justes !");
        paper.r199.test(50,220,1150,200);
        paper.p200.test(65,735,60.00000000000004,32.00000000000002,"grey");
        paper.p201.test(1185,735,60.00000000000004,32.00000000000002,"black");
        paper.t202.test(280,998,"Une divinité féminine est\nune...");
        paper.i203.test("../resource/millions.png",125,548,310,310);
        paper.r204.test(115,435,330,600);
        paper.t205.test(625,735,"Parmi ces fruits, lequel\npossède un noyau?");
            paper.r206.test(460,435,330,600);
        paper.t207.test(970,735,"Traditionnellement, le\njustaucorps est porté par...");
        paper.r208.test(805,435,330,600);

        onClickMock(paper.p201);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Correct, mais ne relachez pas vos efforts !\nVous avez répondu à 14 questions,  dont 7 sont justes !");
        paper.r199.test(50,220,1150,200);
        paper.p209.test(65,735,60.00000000000004,32.00000000000002,"black");
        paper.p210.test(1185,735,60.00000000000004,32.00000000000002,"black");
        paper.t211.test(280,735,"Traditionnellement, le\njustaucorps est porté par...");
        paper.r212.test(115,435,330,600);
        paper.t213.test(625,735,"Quelle est la capitale de la\nLibye?");
            paper.r214.test(460,435,330,600);
        paper.t215.test(970,735,"Un terrain où on n'a rien\nplanté est une terre...");
        paper.r216.test(805,435,330,600);

    });

    it('should shift wrong answers columns one by one (1 colum,1 line)',function(){
        var quizz = new Quizz(myQuizz);
        for(var i=0;i<quizz.tabQuestions.length;i++){
            quizz.questionsWithBadAnswers.push(quizz.tabQuestions[i]);
        }

        console.log('Length: '+quizz.tabQuestions.length);
        quizz.puzzleLines=1;
        quizz.puzzleRows=1;

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[1].image.id,166,200);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[2].image.id,183,262);
        imageController.imageLoaded(quizz.tabQuestions[7].tabAnswer[3].image.id,225,225);

        quizz.display(50,10,1200,1200);

        for(var i=0;i<quizz.tabQuestions.length;i++){
            onClickMock(quizz.tabQuestions[i].tabAnswer[2].bordure);

        }

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Correct, mais ne relachez pas vos efforts !\nVous avez répondu à 14 questions,  dont 7 sont justes !");
        paper.r199.test(50,220,1150,200);
        paper.p200.test(65,735,60.00000000000004,32.00000000000002,"grey");
        paper.p201.test(1185,735,60.00000000000004,32.00000000000002,"black");
        paper.t202.test(625,1007,"Une divinité féminine est une...");
        paper.i203.test("../resource/millions.png",358,445,534,534);
        paper.r204.test(115,435,1020,600);

        onClickMock(paper.p201);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t198.test(625,320,"Correct, mais ne relachez pas vos efforts !\nVous avez répondu à 14 questions,  dont 7 sont justes !");
        paper.r199.test(50,220,1150,200);
        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.p205.test(65,735,60.00000000000004,32.00000000000002,"black");
        paper.p206.test(1185,735,60.00000000000004,32.00000000000002,"black");
        paper.t207.test(625,735,"Parmi ces fruits, lequel possède un noyau?");
        paper.r208.test(115,435,1020,600);

    });

    it('should select one answer (multiple answers possible)',function(){

        var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
        quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
        var quizz = new Quizz(quizzCopy);

        for(var i=0;i<quizz.tabQuestions.length-1;i++){
            quizz.tabQuestions.pop();
        }

        console.log('Length: '+quizz.tabQuestions.length);

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);

        quizz.display(50,10,1200,1200);

        onClickMock(quizz.tabQuestions[0].tabAnswer[0].bordure);

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t2.test(625,392,"Une divinité féminine est une...");
        paper.i3.test("../resource/millions.png",558,230,134,134);
        paper.r4.test(50,220,1150,200);
        paper.t9.test(333.75,478,"Comtesse");
        paper.r10.test(50,450,567.5,56);

        expect(paper.r10.attr("stroke-width")).toEqual(5);
        expect(paper.r10.attr("stroke")).toEqual('red');

        paper.t11.test(916.25,478,"Déesse");
        paper.r12.test(632.5,450,567.5,56);
        paper.t13.test(333.75,549,"Bougresse");
        paper.r14.test(50,521,567.5,56);
        paper.t15.test(916.25,549,"Diablesse");
        paper.r16.test(632.5,521,567.5,56);
        paper.t17.test(625,658,"Valider");
        paper.r18.test(550,633,150,50);

        onClickMock(quizz.tabQuestions[0].tabAnswer[0].bordure);
        expect(paper.r10.attr("stroke-width")).not.toEqual(5);
        expect(paper.r10.attr("stroke")).not.toEqual('red');

    });

    it('should validate an aswer when clicking on the "Validate" button', function () {

        var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
        quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
        var quizz = new Quizz(quizzCopy);
        var tmpLength=quizz.tabQuestions.length-2;
        for(var i=0;i<tmpLength;i++){
            quizz.tabQuestions.pop();
        }

        console.log('Length: '+quizz.tabQuestions.length);

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);



        quizz.display(50,10,1200,1200);
        console.log=jasmine.createSpy("log");

        onClickMock(quizz.tabQuestions[0].tabAnswer[0].bordure);
        onClickMock(quizz.tabQuestions[0].tabAnswer[1].bordure);
        onClickMock(paper.r18);//bouton "valider"


        expect(console.log).toHaveBeenCalledWith("Bonne réponse!\n");

        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t19.test(625,320,"Parmi ces fruits, lequel possède un noyau?");
        paper.r20.test(50,220,1150,200);
        paper.i24.test("../resource/pomme.jpg",50,449.99999999999994,567.5,613.5135135135134);

        paper.t25.test(916.25,1035.5135135135133,"La cerise");
        paper.i26.test("../resource/cerise.jpg",642.5,484.43665093665084,547.5,498.6402116402116);
        paper.r27.test(632.5,450,567.5,613.5135135135134);

        paper.t28.test(333.75,1385.27027027027,"La poire");
        paper.r29.test(50,1078.5135135135133,567.5,613.5135135135134);
        paper.t30.test(916.25,1385.27027027027,"L'orange");
        paper.r31.test(632.5,1078.5135135135133,567.5,613.5135135135134);



    });

    it('should fail to validate an aswer when clicking on the "Validate" button (no answer selected)', function () {

        var quizzCopy=JSON.parse(JSON.stringify(myQuizz));
        quizzCopy.tabQuestions[0].tabAnswer[0].bCorrect=true;
        var quizz = new Quizz(quizzCopy);

        for(var i=0;i<quizz.tabQuestions.length-1;i++){
            quizz.tabQuestions.pop();
        }

        console.log('Length: '+quizz.tabQuestions.length);

        imageController.imageLoaded(quizz.tabQuestions[0].image.id,1024,1024);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[0].image.id,925,1000);
        imageController.imageLoaded(quizz.tabQuestions[1].tabAnswer[1].image.id,2835,2582);


        quizz.display(50,10,1200,1200);
        console.log=jasmine.createSpy("log");
        onClickMock(paper.r18);//bouton "valider"



        paper.t0.test(625,110,"Qui veut gagner des millions ? Quizz n°1");
        paper.r1.test(50,10,1150,200);
        paper.t19.test(625,320,"Parmi ces fruits, lequel possède un noyau?");
        paper.r20.test(50,220,1150,200);
        paper.i24.test("../resource/pomme.jpg",50,449.99999999999994,567.5,613.5135135135134);
        paper.t25.test(916.25,1035.5135135135133,"La cerise");
        paper.i26.test("../resource/cerise.jpg",642.5,484.43665093665084,547.5,498.6402116402116);
        paper.r27.test(632.5,450,567.5,613.5135135135134);
        paper.t28.test(333.75,1385.27027027027,"La poire");
        paper.r29.test(50,1078.5135135135133,567.5,613.5135135135134);
        paper.t30.test(916.25,1385.27027027027,"L'orange");
        paper.r31.test(632.5,1078.5135135135133,567.5,613.5135135135134);

        expect(console.log).toHaveBeenCalledWith("Mauvaise réponse!\n  Bonnes réponses: Comtesse\nDéesse\n");

    });
});

