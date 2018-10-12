const request = require('request-promise-native');
const oauth2 = require('./oauth2');

async function getAssetId(symbol) {
    const asset = await request.get('https://api.bravenewcoin.com/v3/asset?symbol=' + symbol, {json: true});
    return asset.content[0].id;
}

async function getMarketId(baseSymbol, quoteSymbol) {
    const baseAssetId = await getAssetId(baseSymbol);
    const quoteAssetId = await getAssetId(quoteSymbol);
    return request.get('https://api.bravenewcoin.com/v3/market?baseAssetId=' + baseAssetId + '&quoteAssetId=' + quoteAssetId, {json: true});
}

async function getBearerToken() {
    return request.post('https://auth.bravenewcoin.com/oauth/token', {
        json: true,
        body: oauth2
    });
}

module.exports.getAssetId = getAssetId;
module.exports.getMarketId = getMarketId;
module.exports.getBearerToken = getBearerToken;