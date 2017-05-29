/**
 * Created by TBE3610 on 29/05/2017.
 */

const testutils = require('../lib/testutils'),
    {given, when, loadPage, clickElement, assertPresent} = testutils;

describe('quiz admin', function(){
    it('should create a question', function(){
        let mockResponses = {
            "/medias/images": {code: 200, content: {images: []}}
        };
        let {root, state} = given(()=>{
            return loadPage('GameAdmin', {
                mockResponses,
                className: "Quiz",
                beforeLoad: (page)=>{
                    page.state.formation = page.state.createFormation({_id: "1", "formationId": "2", label:"formation"});
                }
            })
        })
        when(()=>{
            clickElement(root, 'newQuestionButton')
        }).then(()=>{
            assertPresent(root, "questionBlock0")
        })
    });
})