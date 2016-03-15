/**
 * Created by ABL3483 on 10/03/2016.
 */
var myColors={
    blue:{r: 25, g: 122, b: 230},
    primaryBlue:{r: 0, g: 0, b: 255},
    grey:{r: 125, g: 122, b: 117},
    orange:{r: 230, g: 122, b: 25},
    purple:{r: 170, g: 100, b: 170},
    green:{r: 155, g: 222, b: 17},
    raspberry:{r: 194, g: 46, b: 83}
};

var myQuizz=
{
    title: "Qui veut gagner des millions ? Quizz n°1",
    tabQuestions:[
        {label:"Une divinité féminine est une...",imageSrc:"../resource/millions.png",
            tabAnswer: [
                {label:"Comtesse",imageSrc: null,bCorrect:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
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
                    colorBordure:myColors.blue,bgColor:myColors.grey},
                {label:"Les rugbymen",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.grey,bgColor:myColors.grey},
                {label:"Les sumos",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.orange, bgColor:myColors.grey}

            ],
            nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Quelle est la capitale de la Libye?",imageSrc:null, font:"Courier New", fontSize:40,
            tabAnswer: [
                {label:"Malpoli",imageSrc: null,bCorrect:false,
                    colorBordure: myColors.green,bgColor:myColors.grey, font:"Courier New", fontSize:36},
                {label:"Papoli",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:30},
                {label:"Tropoli",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:12},
                {label:"Tripoli",imageSrc:null,bCorrect:true,
                    colorBordure:myColors.green,bgColor:myColors.blue, font:"Times New Roman", fontSize:36}
            ],
            nbrows:4,colorBordure:myColors.primaryBlue,bgColor:myColors.grey},

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
            nbrows: 3,colorBordure:myColors.primaryBlue,bgColor:myColors.blue},

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
            nbrows: 2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

        {label:"Quelle est l'orthographe correcte de ce verbe?",imageSrc:null,
            tabAnswer: [
                {label:"Boïcotter",imageSrc: null,bCorrect:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Boycotter",imageSrc:null,bCorrect:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Boycoter",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}

            ],
            nbrows: 1, colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Comment appelle-t-on un habitant de Flandre?",imageSrc:null,
            tabAnswer: [
                {label:"Un flandrois",imageSrc: null,bCorrect:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Un flamby",imageSrc: "../resource/hollandeContent.jpg",bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Un flamand",imageSrc:"../resource/flamantRose.jpg",bCorrect:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Un flanders", imageSrc: "../resource/flanders.png", bCorrect:false,
                    colorBordure:myColors.green, bgColor:myColors.grey}
            ],
            nbrows: 3, colorBordure:myColors.primaryBlue, bgColor:myColors.purple},

        {label:"Formentera est une île des...",imageSrc:null,
            tabAnswer: [
                {label:"Cyclades",imageSrc: null,bCorrect:false,
                    colorBordure: myColors.green,bgColor:myColors.orange},
                {label:"Antilles",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.purple},
                {label:"Baléares",imageSrc:null,bCorrect:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Canaries",imageSrc:null,bCorrect:false,
                    colorBordure:myColors.green,bgColor:myColors.green}
            ],
            nbrows: 2,colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

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
            nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

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
            nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

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
            nbrows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.grey},

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
    bgColor:myColors.raspberry, puzzleLines:3, puzzleRows:1
};