let request = require("request-promise");
const logger = require("../winston");

const cachedOlsCurieResponses = {};

module.exports = {

    isCurie: function(term){
        let curie = true;
        if (term.split(":").length != 2 || term.includes("http")){
                curie = false;
        }
        return curie;
    },

    expandCurie: function(term, olsApi){

        if (!olsApi)
            olsApi = "https://www.ebi.ac.uk/ols/api";

        const termUri = encodeURIComponent(term);
        const url = olsApi + '/search?q=' + termUri
            + "&exact=true&groupField=true&queryFields=obo_id";

        return new Promise((resolve, reject) => {
            let curieExpandResponsePromise = null;

            if(cachedOlsCurieResponses[url]) {
                curieExpandResponsePromise = Promise.resolve(cachedOlsCurieResponses[url]);
            } else {
                curieExpandResponsePromise = request({
                    method: "GET",
                    url: url,
                    json: true
                })
            }

            curieExpandResponsePromise
                .then(resp => {
                    cachedOlsCurieResponses[url] = resp;
                    let jsonBody = resp;
                    if (jsonBody.response.numFound === 1) {
                        logger.log("debug", "Term found");
                        resolve(jsonBody.response.docs[0].iri);
                    }
                    else {
                        reject("Could not retrieve IRI for " + term);
                    }
                }).catch(err => {
                    reject(err)
                });
        });

    }
};