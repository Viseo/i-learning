/**
 * Created by ABL3483 on 02/03/2016.
 */
var paper=null;
describe('Quizz Test', function() {

    var tabAnswer = [
        {
            label: "My first answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Second answer is...",
            imageSrc: null,
            bCorrect: false,
            colorBordure: {r: 155, g: 222, b: 17},
            bgColor: {r: 125, g: 122, b: 117}
        },
        {
            label: "Third answer is...",
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
    var tabQuestions = [
        {label: 'Q1', imageSrc: "../resource/folder.png", tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}},
        {label: 'Q2', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q3', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q4', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q5', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q6', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q7', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q8', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q9', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q10', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q11', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q12', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q13', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'},
        {label: 'Q14', imageSrc: null, tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: 'purple'}
    ];
   // var quizz;

    beforeEach(function(){
        paper=RaphaelMock(0,0,1500,1500);

        var quizz = new Quizz("Ceci est le titre du Quizz n°1", tabQuestions, {r: 194, g: 46, b: 83});
       // quizz.display(50,10,1200,1200);
    });
    it('should increment the current question index',function() {
        //on se trouve au début,puis à la fin du tableau
        var tabQuestions = [
            {label: 'Q1', imageSrc: "../resource/folder.png", tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}}
    ];

        quizz=new Quizz("Ceci est le titre du Quizz n°1", tabQuestions, {r: 194, g: 46, b: 83});
        quizz.displaySet=paper.set();
        quizz.displaySet.push(paper.rect(50,50,1000,200));
        quizz.displaySet.push(paper.rect(50,300,1000,200));
        var set=paper.set();
        set.push(paper.rect(50,500,1000,200));
        set.push(paper.rect(50,500,1000,200));
        set.push(paper.rect(50,500,1000,200));
        set.push(paper.rect(50,500,1000,200));
        quizz.displaySet.push(set);
        var tmp=quizz.currentQuestionIndex;
        quizz.nextQuestion();
        expect(quizz.currentQuestionIndex).toEqual(tmp+1);
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]).toBeDefined();

    });
    it('should NOT increment the current question index',function() {
        //on se trouve au début,puis à la fin du tableau
        var tabQuestions = [
            {label: 'Q1', imageSrc: "../resource/folder.png", tabAnswer: tabAnswer, nbrows: 2, colorBordure: 'blue', bgColor: {r: 155, g: 222, b: 17}}
        ];
        quizz=new Quizz("Ceci est le titre du Quizz n°1", tabQuestions, {r: 194, g: 46, b: 83});
        var tmp=quizz.currentQuestionIndex;
        quizz.nextQuestion();
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]).toBeDefined();
        quizz.nextQuestion();
        expect(quizz.tabQuestions[quizz.currentQuestionIndex]+1).toBeUndefined();
        expect(quizz.currentQuestionIndex).toNotEqual(tmp+2);

    });
});