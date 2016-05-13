/**
 * Created by ABO3476 on 10/05/2016.
 */

var mongoose = require("mongoose");
var db = mongoose.connect("mongodb://localhost/DATA");

var myBibImageShema = mongoose.Schema({
    title : String,
    tabLib : [],
    font : String,
    fontSize : Number
});
var myBibImage = mongoose.model("myBibImage",myBibImageShema);

var bib = new myBibImage ({
    title: "Bibliothèque",
    tabLib: [
        {imgSrc: "../resource/littleCat.png"},
        {imgSrc: "../resource/millions.png"},
        {imgSrc: "../resource/folder.png"},
        {imgSrc: "../resource/cerise.jpg"},
        {imgSrc: "../resource/ChatTim.jpg"}
    ],
    font:"Courier New", fontSize:20
});
bib.save();