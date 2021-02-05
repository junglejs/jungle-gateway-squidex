const fetch = require('node-fetch');

let token;

async function getToken({client_id, client_secret, url}) {
    if (!client_id) throw new Error('Please provide the client_id');
    if (!client_secret) throw new Error('Please provide the client_secret');
    if (!url) throw new Error('Please provide the url to the Squidex server');

    const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    const body = `client_id=${client_id}&client_secret=${client_secret}&scope=squidex-api&grant_type=client_credentials`;

    const response = await fetch(url + '/identity-server/connect/token', { method: 'POST', headers, body });
    const data = await response.json();

    if (data.error) throw new Error(data.error);
    if (!data.access_token) throw new Error('Unable to get token');

    token = data.access_token;
    return data.access_token;
}

function gatewayContext(headers = {}) {
    return ({
        headers: {...{
            "Authorization": `Bearer ${token}`,
            "X-Languages": "en",
            "X-Flatten": true
        }, ...headers}
    });
}

function flatten(obj) {
    if (Array.isArray(obj)) {
        return obj.map(flatten);
    }
    else if (typeof obj === 'object' && obj !== null && obj.hasOwnProperty('flatData')) {
        return flatten(obj.flatData);
    }
    else if (Object.keys(obj).length > 0) {
        for (let k of Object.keys(obj)) {
            if (Array.isArray(obj[k])) {
               obj[k] = flatten(obj[k]);
            }
            else if (typeof obj[k] === 'object' && obj[k] !== null && obj[k].hasOwnProperty("flatData")) {
              obj[k] = flatten(obj[k])
            }
        }
    }
    return obj;
}

async function middlewareContext(data) {
    return flatten(data);
}

module.exports = {
    getToken,
    gatewayContext,
    middlewareContext
};
