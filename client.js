const request = require('request-promise-native');
const oauth2 = require('./oauth2');

// Find the first asset ID matching the given symbol.
async function getAssetId(symbol) {
    const asset = await request.get('https://api.bravenewcoin.com/v3/asset?symbol=' + symbol, {json: true});
    if (asset.content.length > 1) {
        const choices = asset.content.map( c => c.name).join('\',\'');
        throw new Error(`Found multiple matches for '${symbol}': ['${choices}']`);
    }
    return asset.content[0].id;
}

// Find the first market ID match for the given base and quote symbols.
async function getMarketId(baseSymbol, quoteSymbol) {
    const baseAssetId = await getAssetId(baseSymbol);
    const quoteAssetId = await getAssetId(quoteSymbol);
    const market = await request.get('https://api.bravenewcoin.com/v3/market?baseAssetId=' + baseAssetId + '&quoteAssetId=' + quoteAssetId, {json: true});
    return market.content[0].id;
}

// Find the first exchange with the given exchange name.
async function getExchangeId(name) {
    const exchanges = await request.get('https://api.bravenewcoin.com/v3/exchange', {json: true});
    for (let exchange of exchanges.content) {
        if (name.localeCompare(exchange.name, undefined, { sensitivity: 'accent' }) === 0) {
            return exchange.id;
        }
    }
    throw new Error(`Unable to find exchange with name '${name}'`);
}

async function getBearerToken() {
    return request.post('https://auth.bravenewcoin.com/oauth/token', {
        json: true,
        body: oauth2
    });
}

module.exports.getAssetId = getAssetId;
module.exports.getMarketId = getMarketId;
module.exports.getExchangeId = getExchangeId;
module.exports.getBearerToken = getBearerToken;
