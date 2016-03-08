/**
 * Created by qde3485 on 25/02/16.
 */

paper=Raphael(0,0,document.body.clientWidth,1500);
function main() {
    var myColors={
        blue:{r: 25, g: 122, b: 230},
        primaryBlue:{r: 0, g: 0, b: 255},
        grey:{r: 125, g: 122, b: 117},
        orange:{r: 230, g: 122, b: 25},
        purple:{r: 128, g: 0, b: 128},
        green:{r: 155, g: 222, b: 17},
        raspberry:{r: 194, g: 46, b: 83}
    };
    var myQuizz=
    {
        title: "Qui veut gagner des millions ? Quizz n°1",
        tabQuestions:[
            {label:"Une divinité féminine est une...",imageSrc:"../resource/millions.png", font:"Times New Roman", fontSize: 44,
                tabAnswer: [
                    {label:"Comtesse",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey, font:"Times New Roman", fontSize:36},
                    {label:"Déesse",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Bougresse",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Diablesse",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

            {label:"Parmi ces fruits, lequel possède un noyau?",imageSrc:null,
                tabAnswer: [
                    {label:"",imageSrc: "../resource/pomme.jpg",bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"La cerise",imageSrc:"../resource/cerise.jpg",bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"La poire",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"L'orange",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Traditionnellement, le justaucorps est porté par...",imageSrc:null,
                tabAnswer: [
                    {label:"Les danseuses",imageSrc: null,bCorrect:true,
                        colorBordure: myColors.green,bgColor:myColors.blue},
                    {label:"Les boxeurs",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Les rugbymen",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Les sumos",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}

                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Quelle est la capitale de la Libye?",imageSrc:null,
                tabAnswer: [
                    {label:"Malpoli",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Papoli",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Tropoli",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Tripoli",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Un terrain où on n'a rien planté est une terre...",imageSrc:null,
                tabAnswer: [
                    {label:"Stupide",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Inculte",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Idiote",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Ignare",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Un galurin est un...",imageSrc:null,
                tabAnswer: [
                    {label:"Manteau",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Chapeau",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Gâteau",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Château",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Quelle est l'orthographe correcte de ce verbe?",imageSrc:null,
                tabAnswer: [
                    {label:"Boïcotter",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Boycotter",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Boycoter",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}

                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Comment appelle-t-on un habitant de Flandre?",imageSrc:null,
                tabAnswer: [
                    {label:"Un flandrois",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Un flamby",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Un flamand",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Un flanders",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Formentera est une île des...",imageSrc:null,
                tabAnswer: [
                    {label:"Cyclades",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Antilles",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Baléares",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Canaries",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Quel musée doit son nom à un dessinateur?",imageSrc:null,
                tabAnswer: [
                    {label:"Musée d'Orsay",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Musée Guimet",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Musée Grévin",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Le Louvre",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Comment s'appelle le meilleur ami de Bob l'éponge?",imageSrc:null,
                tabAnswer: [
                    {label:"Luc",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Paul",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Patrick",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Albert",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"Le style 'rococo' était un style artistique en vogue au...",imageSrc:null,
                tabAnswer: [
                    {label:"XVIe siècle",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"XVIIe siècle",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"XVIIIe siècle",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"XIXe siècle",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"L'aspic est une variété de...",imageSrc:null,
                tabAnswer: [
                    {label:"Magnolias",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"Lilas",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"Lavandes",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"Roses",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

            {label:"En quelle année Yevgeny Kafelnikov a-t-il remporté la finale de Roland-Garros en simple?",imageSrc:null,
                tabAnswer: [
                    {label:"1996",imageSrc: null,bCorrect:false,
                        colorBordure: myColors.green,bgColor:myColors.grey},
                    {label:"1998",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey},
                    {label:"1994",imageSrc:null,bCorrect:true,
                        colorBordure:myColors.green,bgColor:myColors.blue},
                    {label:"1999",imageSrc:null,bCorrect:false,
                        colorBordure:myColors.green,bgColor:myColors.grey}
                ],
                nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

        ],
        bgColor:myColors.raspberry
    };

    var quizz = new Quizz(myQuizz);

    // Navigation Puzzle
    /*var puzzle = new Puzzle(3, 3, tabQuestions);
     puzzle.display(20, 20, 600, 600, 0);*/

    //var quizz=new Quizz("Ceci est le titre du Quizz n°1",tabQuestions);
    //quizz.display();

    // Display in rows
    /*var nbRows = 3;
     var tabAnswer = [{label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}, {label: "", imageSrc: null, bCorrect: false}];
     var question = new Question(null, null, tabAnswer, nbRows);
     question.display(50, 50, 1000, 200);*/

    //Display Resultat Puzzle
    //quizz.displayResult(50, 10, 1200, 1200, myColors.grey);
}
