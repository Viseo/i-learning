/**
 * Created by ABO3476 on 04/05/2016.
 */

var FormationStructure =
{
    name: String,
    lastVersion: objectId, //(FormationVersion)
    lastVersionPublished: objectId //(FormationVersion)
};



/*LastVersion & LastVersionPublished permettent d'avoir la valeur de "status" ("non publié", "publié", "nouvelle version à publier") :
 (LastVersion === LastVersionPublished) => Publiée
 (!LastVersionPublished) => Non publiée
 (LastVersionPubliée && LastVersion !== LastVersionPublished) => "Nouvelle version à publier"*/


var FormationVersionStructure =
{
    parentFormation: objectId (Formation),
    num: Number,
    tabLevels: [
    {
        num: Number,
        tabGames: [
        {
            _id: objectId,
            parentsGame: [objectId],
            childrenGame: [objectId],
            tabQuestions: [
            {
                questionData: {1},
                tabReponses: [{2}]
            }]
        }]
    }]
};

var myColorsOld={
    blue:{r: 25, g: 122, b: 230},
    primaryBlue:{r: 0, g: 0, b: 255},
    grey:{r: 125, g: 122, b: 117},
    orange:{r: 230, g: 122, b: 25},
    purple:{r: 170, g: 100, b: 170},
    green:{r: 155, g: 222, b: 17},
    raspberry:{r: 194, g: 46, b: 83},
    black:{r:0, g:0, b:0},
    white:{r:255, g:255, b:255}
};

var REGEX = /^([A-Za-z0-9.éèêâàîïëôûùö ©,;°?!'"-]){0,150}$/g;
var REGEXERROR = "Seuls les caractères alphanumériques, avec accent et \"-,',.;?!°© sont permis.";

var MARGIN = 10;

var myColors = {
    darkBlue: [25, 25, 112],
    blue:[25, 122, 230],
    primaryBlue:[0, 0, 255],
    grey:[125, 122, 117],
    lightgrey:[242,242,241],
    orange:[230, 122, 25],
    purple:[170, 100, 170],
    green:[155, 222, 17],
    raspberry:[194, 46, 83],
    black:[0, 0, 0],
    white:[255, 255, 255],
    red:[255, 0, 0],
    yellow:[255,255,0],
    pink:[255,20,147],
    brown:[128,0,0],
    none:[]
};
db.BDD.insert(
    {
        myColorsOld:myColorsOld,
        myColors:myColors
    });


var SELECTION_COLOR = myColors.darkBlue;


var myBibImage = {
    title: "Bibliothèque",
    tabLib: [
        {imgSrc: "../resource/littleCat.png"},
        {imgSrc: "../resource/millions.png"},
        {imgSrc: "../resource/folder.png"},
        {imgSrc: "../resource/cerise.jpg"},
        {imgSrc: "../resource/ChatTim.jpg"}
    ],
    font:"Courier New", fontSize:20
};

db.BDD.insert(myBibImage);

var defaultQuestion = {
    label:"",imageSrc:"", multipleChoice:false,
    tabAnswer: [
        {label:"",imageSrc: null,correct:false,
            colorBordure: myColors.black,bgColor:myColors.white},
        {label:"",imageSrc:null,correct:false,
            colorBordure:myColors.black,bgColor:myColors.white}
    ],
    rows:4,colorBordure:myColors.black,bgColor:myColors.white};
db.BDD.insert(defaultQuestion);

var defaultQuizz = {
    title:"Quizz pas rempli",
    bgColor:myColors.white,
    puzzleLines:3,
    puzzleRows:1,
    tabQuestions:[defaultQuestion]
};
db.BDD.insert(defaultQuizz);


var questionWithLabelImageAndMultipleAnswers = {
    label:"Une divinité féminine est une...",imageSrc:"../resource/millions.png", multipleChoice:true,
    tabAnswer: [
        {label:"Comtesse",imageSrc: null,correct:false,
            colorBordure: myColors.green,bgColor:myColors.grey},
        {label:"Déesse",imageSrc:null,correct:true,
            colorBordure:myColors.green,bgColor:myColors.blue},
        {label:"Bougresse",imageSrc:null,correct:false,
            colorBordure:myColors.green,bgColor:myColors.grey},
        {label:"Diablesse",imageSrc:null,correct:false,
            colorBordure:myColors.green,bgColor:myColors.grey}
    ],
    rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green};
db.BDD.insert(questionWithLabelImageAndMultipleAnswers);

var myQuestion2 =
{label:"Parmi ces fruits, lequel possède un noyau?",imageSrc:null, multipleChoice:true,
    tabAnswer: [
        {label:"",imageSrc: "../resource/pomme.jpg",correct:false,
            colorBordure: myColors.green,bgColor:myColors.white},
        {label:"La cerise",imageSrc:"../resource/cerise.jpg",correct:true,
            colorBordure:myColors.green,bgColor:myColors.blue},
        {label:"La poire",imageSrc:null,correct:false,
            colorBordure:myColors.green,bgColor:myColors.grey},
        {label:"L'orange",imageSrc:null,correct:false,
            colorBordure:myColors.green,bgColor:myColors.grey}
    ],
    rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple};
db.BDD.insert(myQuestion2);

var myQuizz={
    title:"Qui veut gagner des millions ? Quizz n°1",
    bgColor:myColors.raspberry,
    puzzleLines:3,
    puzzleRows:1,
    tabQuestions:[
        questionWithLabelImageAndMultipleAnswers, myQuestion2,
        {label:"Traditionnellement, le justaucorps est porté par...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Les danseuses",imageSrc: null,correct:true,
                    colorBordure: myColors.green,bgColor:myColors.blue},
                {label:"Les boxeurs",imageSrc:null,correct:false,
                    colorBordure:myColors.blue,bgColor:myColors.grey},
                {label:"Les rugbymen",imageSrc:null,correct:false,
                    colorBordure:myColors.grey,bgColor:myColors.grey},
                {label:"Les sumos",imageSrc:null,correct:false,
                    colorBordure:myColors.orange, bgColor:myColors.grey}

            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Quelle est la capitale de la Libye?",imageSrc:null, multipleChoice:false, font:"Courier New", fontSize:40,
            tabAnswer: [
                {label:"Malpoli",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey, font:"Courier New", fontSize:36},
                {label:"Papoli",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:30},
                {label:"Tropoli",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:12},
                {label:"Tripoli",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue, font:"Times New Roman", fontSize:36}
            ],
            rows:4,colorBordure:myColors.primaryBlue,bgColor:myColors.grey},

        {label:"Un terrain où on n'a rien planté est une terre...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Stupide",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Inculte",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Idiote",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Ignare",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows: 3,colorBordure:myColors.primaryBlue,bgColor:myColors.blue},

        {label:"Un galurin est un...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Manteau",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Chapeau",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Gâteau",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Château",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows: 2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

        {label:"Quelle est l'orthographe correcte de ce verbe?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Boïcotter",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Boycotter",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Boycoter",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}

            ],
            rows: 1, colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Comment appelle-t-on un habitant de Flandre?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Un flandrois",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Un flamby",imageSrc: "../resource/hollandeContent.jpg",correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Un flamand",imageSrc:"../resource/flamantRose.jpg",correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Un flanders", imageSrc: "../resource/flanders.png", correct:false,
                    colorBordure:myColors.green, bgColor:myColors.grey}
            ],
            rows: 3, colorBordure:myColors.primaryBlue, bgColor:myColors.purple},

        {label:"Formentera est une île des...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Cyclades",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.orange},
                {label:"Antilles",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.purple},
                {label:"Baléares",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Canaries",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.green}
            ],
            rows: 2,colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Quel musée doit son nom à un dessinateur?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Musée d'Orsay",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Musée Guimet",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Musée Grévin",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Le Louvre",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

        {label:"Comment s'appelle le meilleur ami de Bob l'éponge?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Luc",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Paul",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Patrick",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Albert",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

        {label:"Le style 'rococo' était un style artistique en vogue au...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"XVIe siècle",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"XVIIe siècle",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"XVIIIe siècle",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"XIXe siècle",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

        {label:"L'aspic est une variété de...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Magnolias",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Lilas",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Lavandes",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Roses",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.grey},

        {label:"En quelle année Yevgeny Kafelnikov a-t-il remporté la finale de Roland-Garros en simple4",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"1996",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"1998",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"1994",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"1999",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.purple}

    ]
};

db.BDD.insert(myQuizz);

var myQuizzDemo={
    title:"Qui veut gagner des millions ? Quizz n°1",
    tabQuestions:[
        {label:"Parmi ces divinités, lesquelles sont de sexe féminin?",imageSrc:"../resource/millions.png", multipleChoice:false,
            tabAnswer: [
                {label:"Athéna",imageSrc: null,correct:true,
                    colorBordure: myColors.green,bgColor:myColors.blue},
                {label:"Isis",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Epona",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Freyja",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue}
            ],
            rows:4,colorBordure:myColors.primaryBlue,bgColor:myColors.green},

        {label:"Parmi ces fruits, lequel ne possède pas de noyau?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"",imageSrc: "../resource/pomme.jpg",correct:true,
                    colorBordure: myColors.green,bgColor:myColors.blue},
                {label:"La cerise",imageSrc:"../resource/cerise.jpg",correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"La poire",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"L'orange",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue}
            ],
            rows:3,colorBordure:myColors.primaryBlue,bgColor:myColors.purple},

        {label:"Quelle ceinture n'existe pas au judo?",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Bleue",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Violette",imageSrc:null,correct:true,
                    colorBordure:myColors.blue,bgColor:myColors.blue},
                {label:"Demi-verte (orange et verte)",imageSrc:null,correct:false,
                    colorBordure:myColors.grey,bgColor:myColors.grey},
                {label:"Demi-marron (bleue et marron)",imageSrc:null,correct:true,
                    colorBordure:myColors.orange, bgColor:myColors.blue}

            ],
            rows:2,colorBordure:myColors.primaryBlue,bgColor:myColors.orange},

        {label:"Quelle est la capitale de la Libye?",imageSrc:null, multipleChoice:false, font:"Courier New", fontSize:40,
            tabAnswer: [
                {label:"Malpoli",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey, font:"Courier New", fontSize:36},
                {label:"Papoli",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:30},
                {label:"Tropoli",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Lucida Grande", fontSize:12},
                {label:"Aïoli",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey, font:"Times New Roman", fontSize:36}
            ],
            rows:1,colorBordure:myColors.primaryBlue,bgColor:myColors.grey},

        {label:"Un terrain où on n'a rien planté est une terre...",imageSrc:null, multipleChoice:false,
            tabAnswer: [
                {label:"Stupide",imageSrc: null,correct:false,
                    colorBordure: myColors.green,bgColor:myColors.grey},
                {label:"Inculte",imageSrc:null,correct:true,
                    colorBordure:myColors.green,bgColor:myColors.blue},
                {label:"Idiote",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey},
                {label:"Ignare",imageSrc:null,correct:false,
                    colorBordure:myColors.green,bgColor:myColors.grey}
            ],
            rows: 3,colorBordure:myColors.primaryBlue,bgColor:myColors.blue}
    ],
    bgColor:myColors.raspberry, puzzleLines:3, puzzleRows:1
};
db.BDD.insert(myQuizzDemo);

var uniqueAnswerValidationTab = [
    function (quiz) {
        // Check Quiz Name:
        var isValid = (quiz.quizzName !== "");
        var message = "Vous devez remplir le nom du quiz.";
        return {isValid:isValid, message: message};
    },
    function (quiz) {
        // Check Question Name:
        var isValid = (quiz.questionCreator.label) || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image);
        var message = "Vous devez remplir le nom de la question.";
        return {isValid:isValid, message: message};
    },
    function (quiz) {
        // Check 1 Correct Answer:
        var correctAnswers = 0;
        quiz.questionCreator.tabAnswer.forEach(function (el) {
            if (el instanceof AnswerElement) {
                if (el.correct) {
                    correctAnswers++;
                }
            }
        });
        console.log(correctAnswers);
        var isValid = (correctAnswers === 1);
        var message = "Votre quiz doit avoir une bonne réponse.";
        return {isValid:isValid, message: message};
    },
    function (quiz) {
        // Check at least 1 valid answer:
        var isFilled = false;
        quiz.questionCreator.tabAnswer.forEach(function (el) {
            if (el instanceof AnswerElement) {
                isFilled = (isFilled) || (el.label) || (el.manipulator.ordonator.children[2] instanceof svg.Image);
            }
        });
        var isValid = (isFilled);
        var message = "Vous devez remplir au moins une réponse.";
        return {isValid:isValid, message: message};
    }
];

var multipleAnswerValidationTab = [
    function (quiz) {
        // Check Quiz Name:
        var isValid = (quiz.quizzName !== "");
        var message = "Vous devez remplir le nom du quiz.";
        return {isValid:isValid, message: message};
    },
    function (quiz) {
        // Check Question Name:
        var isValid = (quiz.questionCreator.label !== "") || (quiz.questionCreator.questionManipulator.ordonator.children[2] instanceof svg.Image);
        var message = "Vous devez remplir le nom de la question.";
        return {isValid:isValid, message: message};
    },
    function (quiz) {
        // Check at least 1 valid answer:
        var isFilled = false;
        quiz.questionCreator.tabAnswer.forEach(function (el) {
            if (el instanceof AnswerElement) {
                isFilled = isFilled || (el.label) || (el.manipulator.ordonator.children[2] instanceof svg.Image);
            }
        });
        var isValid = isFilled;
        var message = "Vous devez remplir au moins une réponse.";
        return {isValid:isValid, message: message};
    }
];

var formationValidation = [
    function (formation) {
        // Check Formation Name:
        var isValid = (formation.formationName !== "");
        var message = "Vous devez remplir le nom de la formation.";
        return {isValid:isValid, message: message};
    }
];

var myQuizzType = {
    //tab: [{label:"Réponse unique"}, {label:"Réponses multiples"}, {label:"test"}]
    tab: [{label:"Réponse unique", default:true, validationTab:uniqueAnswerValidationTab}, {label:"Réponses multiples", default:false, validationTab:multipleAnswerValidationTab}]
};
db.BDD.insert(myQuizzType);

var statusEnum = {
    Published:{icon: function(x, y, size){
        var check = drawCheck(x, y, size).color(myColors.none, 5, myColors.white);
        var square = new svg.Rect(size, size).color(myColors.green);
        return {check: check, square: square};
    }
    },
    Edited: {icon: function(size){
        var self = this;
        self.circle = new svg.Circle(size/2).color(myColors.orange);
        self.exclamation = new svg.Rect(size/7, size/2.5).position(0, -size/6).color(myColors.white);
        self.dot = new svg.Rect(size/6.5, size/6.5).position(0, size/4).color(myColors.white);
        return self;
    }
    },
    NotPublished: {icon: null}
};

var myFormations = {
    tab: [{label:"Hibernate",status:statusEnum.NotPublished}, {label:"Perturbation Ordre Alphabétique",status:statusEnum.Published}, {label:"HTML3",status:statusEnum.Edited}, {label:"Javascript"},
        {label:"Nouvelle formation"}, {label:"Une autre formation",status:statusEnum.Edited}, {label:"Formation suivante"}, {label:"AA"},{label:"Hibernate"}, {label:"Perturbation Ordre Alphabétique"}, {label:"HTML3"}, {label:"Javascript"},
        {label:"Nouvelle formation"}, {label:"Une autre formation"}, {label:"Formation suivante"}, {label:"AA",status:statusEnum.Published},{label:"Hibernate"}, {label:"Perturbation Ordre Alphabétique"}, {label:"HTML3"}, {label:"Javascript"},
        {label:"Nouvelle formation"}, {label:"Une autre formation"}, {label:"Formation suivante",status:statusEnum.Edited}, {label:"AA"}, {label: "ZEdernier"}]
};
db.BDD.insert(myFormations);

var myBibJeux= {
    title: "Type de jeux",
    tabLib: [
        {label: "Quiz"},
        {label: "BD"}
    ],
    font:"Courier New", fontSize:20
};
db.BDD.insert(myBibJeux);

var myFormation = {
    gamesCounter:{
        quizz: 0,
        bd: 0}
    ,
    quizzTab:[[{type: "Quiz", label: "Quiz 0"}, {type: "BD", label: "BD 0"}, {type: "Quiz", label: "Le premier Quiz"}]]
};
db.BDD.insert(myFormation);