const WebSocket = require('ws');
const client = require('./client.js');

let requestId = 1;


client.getBearerToken().then(response => {
    const ws = new WebSocket('wss://ws.bravenewcoin.com?access_token=' + response.access_token, undefined, {});

    ws.onclose = function close(event) {
        console.log('disconnected');
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down event.code is usually 1006 in this case.
            console.log('[close] Connection died');
        }
    };

    ws.onerror = function error(error) {
        console.error(`[error] ${error.message}`);
    };

    ws.onmessage = function incoming(event) {
        console.log(`[message] Data received from server: ${event.data}`);
    };

    ws.onopen = function open() {
        console.log('connected');

        // Send a PING every 60 seconds or so...
        const interval = setInterval(() => ws.send(JSON.stringify({
            event: 'PING',
            requestId: requestId++
        })), 60000);
        ws.on('close', () => clearInterval(interval));

        // Subscribe to all exchange tickers for Bitcoin to Korean Wan.
        client.getMarketId('BTC', 'KRW')
            .then(market => ws.send(JSON.stringify({
                event: 'SUBSCRIBE_EXCHANGE_TICKER',
                marketId: market,
                requestId: requestId++
            })));

        // Subscribe to BTC/USDT on Binance exchange.
        Promise.all([
            client.getMarketId('BTC', 'USDT'),
            client.getExchangeId('binance')
        ]).then((results) => ws.send(JSON.stringify({
            event: 'SUBSCRIBE_EXCHANGE_TICKER',
            marketId: results[0],
            exchangeId: results[1],
            requestId: requestId++
        }))).catch(error => console.error('Subscribe to binance BTC/USDT failed', error));

        // Subscribe to trades on BTSE.
        client.getExchangeId('btse')
            .then(exchange => ws.send(JSON.stringify({
                event: 'SUBSCRIBE_TRADE',
                exchangeId: exchange,
                requestId: requestId++
            })));

        // Subscribe to the BLX.
        ws.send(JSON.stringify({
            event: 'SUBSCRIBE_INDEX_TICKER',
            indexType: 'LX',
            requestId: requestId++
        }));

        // Subscribe to Bitcoin GWA index.
        client.getAssetId('BTC')
            .then(asset => ws.send(JSON.stringify({
                event: 'SUBSCRIBE_INDEX_TICKER',
                indexId: asset,
                requestId: requestId++
            })));

        // Subscribe to the Bitcoin/Korean won MWA index.
        client.getMarketId('BTC', 'KRW')
            .then(market => ws.send(JSON.stringify({
                event: 'SUBSCRIBE_INDEX_TICKER',
                indexId: market,
                requestId: requestId++
            })));
    };
});
