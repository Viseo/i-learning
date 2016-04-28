///**
// * Created by ABO3476 on 16/03/2016.
// */
//
//
////var imageController = ImageController(ImageRuntime);
//var asyncTimerController=AsyncTimerController(AsyncTimerRuntime);
//paper=null;
//describe('bibimage', function() {
//
//    beforeEach(function () {
//        paper = RaphaelMock(0, 0, 1500, 1500);
//    });
//
//
//    it('should display biblio image', function () {
//
//        var bibimage = new BibImage(myBib);
//        imageController.imageLoaded(bibimage.tabImgBib[0].id, 1024, 1024);
//        imageController.imageLoaded(bibimage.tabImgBib[1].id, 925, 1000);
//        imageController.imageLoaded(bibimage.tabImgBib[2].id, 2835, 2582);
//        imageController.imageLoaded(bibimage.tabImgBib[3].id, 256, 256);
//        bibimage.run(10,10,200,500);
//        bibimage.intervalToken.next();
//        //bibimage.display(10, 10, 500, 500);
//
//        expect(bibimage.tabImgBib[0].imageLoaded).toEqual(true);
//        expect(bibimage.tabImgBib[1].imageLoaded).toEqual(true);
//        expect(bibimage.tabImgBib[2].imageLoaded).toEqual(true);
//        expect(bibimage.tabImgBib[3].imageLoaded).toEqual(true);
//
//        paper.r0.test(10,10,200,500);
//        paper.t1.test(110,60,"Bibliotheque");
//        paper.i2.test("../resource/millions.png",22.5,100,50,50);
//        paper.i3.test("../resource/pomme.jpg",86.875,100,46.25,50);
//        paper.i4.test("../resource/cerise.jpg",147.5,102.2310405643739,50,45.5379188712522);
//        paper.i5.test("../resource/folder.png",22.5,162.5,50,50);
//    });
//});
