/**
 * Created by qde3485 on 25/02/16.
 */

describe('Response', function() {
    it('should instantiate correctly my response with label & no imageSrc', function() {
        var response = new Reponse("My first answer is...", null, false, {r: 155, g: 222, b: 17});

        expect(response.correct).toEqual(false);
        expect(response.label).toEqual("My first answer is...");
        expect(response.imageSrc).toEqual(null);
        expect(response.rgbBordure).toEqual({r: 155, g: 222, b: 17});
    });

    it('should instantiate correctly my response with imageSrc & no label', function() {
        var response = new Reponse(null, "mypic.jpg", false, {r: 125, g: 122, b: 117});

        expect(response.correct).toEqual(false);
        expect(response.label).toEqual(null);
        expect(response.imageSrc).toEqual("mypic.jpg");
        expect(response.rgbBordure).toEqual({r: 125, g: 122, b: 117});
    });
});