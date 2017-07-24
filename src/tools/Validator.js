/**
 * Created by minhhuyle on 24/07/2017.
 */
exports.Validator = function(globalVariables){

    class FormationValidator {
        constructor(){

        }

        static checkNameFormation(label, formationsList){
            let formationNameRegex = /^[^\s]([\sA-Za-z0-9.:+#@%éèêâàîïëôûùöÉÈÊÂÀÎÏËÔÛÙÖ'-]){2,50}$/g;

            if (label == 'Ajouter une formation'){
                return {status: false, error: 'Veuillez entrer un titre valide.'};
            }
            let filter = (form)=>{
                return form.label == label;
            }
            let testArray = formationsList.filter(filter);

            if (testArray.length != 0){
                return {status: false, error: 'Nom déjà utilisé'}
            }
            if (label.length<2){
                return {status: false, error:'Attention : Minimum 2 caractères.'}
            }
            if (!label.match(formationNameRegex)){
                return {status: false, error:'Caractère(s) non autorisé(s).'}
            }
            return {status: true};
        }
    }


    return {
        FormationValidator
    }
};