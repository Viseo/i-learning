/**
 * Created by ABL3483 on 18/03/2016.
 */
window.paper=null;
var imageController = new ImageController(ImageRuntime);
var asyncTimerController=AsyncTimerController(AsyncTimerRuntime);
describe('Question Creator', function() {
    var puzzle;

    beforeEach(function () {
        paper = RaphaelMock(0, 0, 1500, 1500);
        //puzzle=new Puzzle(0,0,1500,1500,2,3,questions);

    });

    it('Should add a new Answer to the question creator puzzle (Q10 - T3)', function () {

        var quizz=new Quizz(myQuizz);
        var questionCreator = new QuestionCreator();
        questionCreator.displayQuestionCreator(20, 20, document.body.clientWidth-50, 850);
        questionCreator.displayPreviewButton(20, 890, document.body.clientWidth-50, 75);
        var tabAddAnswersElements=[];
        for(var i=0;i<3;i++){
            tabAddAnswersElements.push(questionCreator.displaySet[questionCreator.displaySet.length-(i+1)]);
        }
        expect(questionCreator.tabAnswer.length).toEqual(3);
        questionCreator.tabAnswer[(questionCreator.tabAnswer.length-1)];
        onDblclickMock(paper.t12);
        expect(questionCreator.tabAnswer.length).toEqual(4);
        expect(questionCreator.tabAnswer[(questionCreator.tabAnswer.length-1)] instanceof AddEmptyElement).toBeTruthy();
    });

});