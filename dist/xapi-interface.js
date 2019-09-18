function initLrs() {
    // xAPI configuration is sent in the URL query string parameters
    var urlParams = new URLSearchParams(window.location.search);

    var endpoint = urlParams.get('endpoint');
    var auth = urlParams.get('auth');

    var actor = JSON.parse(urlParams.get('actor')); // this needs to be JSON decoded
    var activity_id = urlParams.get('activity_id');
    var registration = urlParams.get('registration');

    if (!endpoint) {
        return null;
    }

    var lrs = new TinCan.LRS({
        endpoint: endpoint,
        auth: auth
    });

    return {
        "lrs": lrs,
        "actor": actor,
        "activity_id": activity_id,
        "registration": registration
    };
}

function saveStatement(lrs, statement) {
    return new Promise(function(resolve, reject) {
        lrs.saveStatement(statement, {
            callback: function(error, xhr) {
                if (error) {
                    reject({
                        error: error,
                        xhr: xhr
                    });
                } else {
                    resolve(xhr);
                }
            }
        });
    });
}
