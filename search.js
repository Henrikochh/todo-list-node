const axios = require('axios');
const querystring = require('querystring');

const allowedProviders = ['/search/v2'];

async function getHtml(req) {
    const { provider, terms } = req.body;
    const userid = req.session.userid;

    if (!provider || !terms || !userid) {
        return "Not enough information provided";
    }

    if (!allowedProviders.includes(provider)) {
        return "Invalid provider";
    }

    const theUrl = `http://localhost:3000${provider}?userid=${userid}&terms=${terms}`;
    return await callAPI('GET', theUrl, false);
}

async function callAPI(method, url, data){
    let noResults = 'No results found!';
    let result;

    switch (method){
        case "POST":
            if (data) {
                result = await axios.post(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.post(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        case "PUT":
            if (data) {
                result = await axios.put(url, data)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            } else {
                result = await axios.put(url)
                    .then(response => {
                        return response.data;
                    })
                    .catch(error => {
                        return noResults;
                    });
            }
            break;
        default:
            if (data)
                url = url+'?'+querystring.stringify(data);

            result = await axios.get(url)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    return noResults;
                });
    }

    return result ? result : noResults;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { html: getHtml };