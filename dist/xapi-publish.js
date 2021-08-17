
var ADL_VERBS_ROOT = "http://adlnet.gov/expapi/verbs/";
var OL_VERBS_ROOT = "https://xapi.openlearning.com/verbs/";
var SUPPORTING_MEDIA_ATTACHMENT = "http://id.tincanapi.com/attachment/supporting_media";
var LRS_CONFIG = initLrs();

function createSupportingMedia(contentType, fileUrl, display, description) {
    if (typeof display === "string") {
        display = {
            "en-US": display
        };
    }

    if (typeof description === "string") {
        description = {
            "en-US": description
        }
    }

    return {
        "contentType": contentType,
        "usageType": SUPPORTING_MEDIA_ATTACHMENT,
        "display": display,
        "description": description,
        "fileUrl": fileUrl
    }
}

function publishStatement(config, attachments) {
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
            id: OL_VERBS_ROOT + "published",
            display: {
                "en-US" : "published"
            },
        },
        attachments: attachments
    });
}

function publishAttachments(attachments) {
    if (!LRS_CONFIG) {
        return new Promise(function(resolve, reject) {
            return reject({
                error: 'No LRS configured in the URL.',
                xhr: null
            });
        });
    }

    var lrs = LRS_CONFIG.lrs;
    var statement = publishStatement(LRS_CONFIG, attachments);
    return saveStatement(lrs, statement);
}
