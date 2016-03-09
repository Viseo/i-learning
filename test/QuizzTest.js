/**
 * Created by ABL3483 on 02/03/2016.
 */
var paper=null;
describe('Quizz Test', function() {

    var tabAnswerQuizz = [
        {
            label: "My first answer is... Alexis Tsipras doit dénoncer, lundi, à Bruxelles, la fermeture de la route des Balkans, lors du sommet avec la Turquie sur la question des réfugiés.My first answer is... Alexis Tsipras doit dénoncer, lundi, à Bruxelles, la fermeture de la route des Balkans, lors du som",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Second answer is... La construction de deux réacteurs à Hinkley Point (Grande-Bretagne) mettrait les comptes d’EDF en péril, selon son directeur financier, qui a démissionné. Mais le projet est lourd d’enjeux pour l’énergéticien.",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Third answer is... La centrale, très critique sur de nombreux points du texte actuel, est en position de force pour imposer ses vues. Laurent Berger doit rencontrer M. Valls lundi.",
            imageSrc: null,
            bCorrect: true,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 25, g: 122, b: 230}
        },
        {
            label: "Fourth answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 230, g: 122, b: 25}
        },
        {
            label: "Fifth answer is...",
            imageSrc: "../resource/spectre.png",
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 230, g: 122, b: 25}
        }
    ];
    var tabQuestionsQuizz = [
        {label: 'Q1 Cet ex-détenu de Guantanamo a fait convoquer l’ancien commandant américain du camp devant la justice française, mardi. Engagé dans la prévention de la radicalisation, son espace de parole s’est réduit depuis le 13 novembre.'
            , imageSrc: "../resource/folder.png", tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}},
        {label: 'Q2', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q3', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q4', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q5', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q6', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q7', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q8', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q9', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q10', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q11', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q12', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q13', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q14', imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'}
    ];
   // var quizz;

    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);

        var quizz = new Quizz("Ceci est le titre du Quizz n°1", tabQuestionsQuizz, {r: 194, g: 46, b: 83});
        console.log("before each quizztest");
       // quizz.display(50,10,1200,1200);
    });
    it('should increment the current question index',function() {
        //on se trouve au début,puis à la fin du tableau
        var tabQuestionsQuizz = [
            {label: 'Q1 23456', imageSrc: "../resource/folder.png", tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}}
    ];

        quizz=new Quizz("Ceci est le titre du Quizz n°1", tabQuestionsQuizz, {r: 194, g: 46, b: 83});
        quizz.display(0,0,1200,1200);
        var tmp=quizz.currentQuestionIndex;
        quizz.nextQuestion();
        expect(quizz.currentQuestionIndex).toEqual(tmp+1);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]).toBeDefined();

    });
    it('should NOT increment the current question index',function() {
        //on se trouve au début,puis à la fin du tableau
        var tabQuestionsQuizz = [
            {label: 'Q1 Cet ex-détenu de Guantanamo a fait convoquer l’ancien commandant américain du camp devant la justice française, mardi. Engagé dans la prévention de la radicalisation, son espace de parole s’est réduit depuis le 13 novembre.'
                , imageSrc: null, tabAnswer: tabAnswerQuizz, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}}
        ];
        quizz=new Quizz("Ceci est le titre du Quizz n°1", tabQuestionsQuizz, {r: 194, g: 46, b: 83});
       /* quizz.displaySet=paper.set();
        quizz.displaySet.push(paper.text("youhou!"));*/
        //quizz.display(10,10,1200,1200);
        //quizz.quizzMarginX=10;
        //quizz.quizzMarginY=10;
        /*quizz.cadreQuestion.w=1200;
        quizz.cadreResult.w=1200-10;
        quizz.cadreResult.x=10;
        quizz.cadreTitle.w=1200;*/
        var tmp=quizz.currentQuestionIndex;
        quizz.nextQuestion();
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]).toBeDefined();
        quizz.nextQuestion();
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]+1).toBeUndefined();
        expect(quizz.currentQuestionIndex).toNotEqual(tmp+2);

    });
});