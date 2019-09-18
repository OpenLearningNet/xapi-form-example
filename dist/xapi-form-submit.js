
var ADL_VERBS_ROOT = "http://adlnet.gov/expapi/verbs/";
var OL_EXTENSIONS_ROOT = "https://xapi.openlearning.com/extensions/";
var LRS_CONFIG = initLrs();

function completedStatement(config, formData) {
    var ol_extensions = {};
    ol_extensions[OL_EXTENSIONS_ROOT + "form-data"] = formData;
    return new TinCan.Statement({
        actor: config.actor, // the actor data sent by OpenLearning
        object: {
            id: config.activity_id, // the activity_id sent by OpenLearning
            objectType: "Activity"
        },
        context: {
            registration: config.registration // the registration sent by OpenLearning
        },
        verb: {
            id: ADL_VERBS_ROOT + "completed",
            display: {
                "de-DE" : "beendete",
                "en-US" : "completed",
                "fr-FR" : "a terminé",
                "es-ES" : "completó"
            },
        },
        result: {
            completion: true,
            extensions: ol_extensions
        }
    });
}

function formToObject(form) {
    var formData = new FormData(form);
    var object = {};
    formData.forEach(function(value, key) {
        if (!object.hasOwnProperty(key)) {
            object[key] = value;
            return;
        }
        if (!Array.isArray(object[key])) {
            object[key] = [object[key]];    
        }
        object[key].push(value);
    });
    return object;
}

function submitFormObject(formObject) {
    if (!LRS_CONFIG) {
        return new Promise(function(resolve, reject) {
            return reject({
                error: 'No LRS configured in the URL.',
                xhr: null
            });
        });
    }

    var lrs = LRS_CONFIG.lrs;
    var statement = completedStatement(LRS_CONFIG, formObject);
    return saveStatement(lrs, statement);
}

function submitForm(form, startCallback, completeCallback) {
    var formObject = formToObject(form);
    startCallback(formObject);
    submitFormObject(formObject).then(
        function(xhr) {
            completeCallback(null, formObject, xhr);
        },
        function(errorResult) {
            completeCallback(errorResult.error, formObject, errorResult.xhr);
        }
    );
}

function xApiFormSubmit(startCallback, completeCallback) {
    return function(event) {
        event.preventDefault();
        submitForm(event.currentTarget, startCallback, completeCallback);
    };
}

function initXApiForm(form, onSubmitStart, onSubmitComplete) {
    form.addEventListener("submit", xApiFormSubmit(onSubmitStart, onSubmitComplete));
}
