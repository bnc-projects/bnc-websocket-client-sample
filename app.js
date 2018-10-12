const websocket = require('ws');
const client = require('./client.js');

client.getBearerToken().then(response => {
    const ws = new websocket('wss://ws.bravenewcoin.com?access_token=' + response.access_token, {});

    ws.on('open', async function open() {
        console.log('connected');
        ws.send('{\'event\':\'PING\'}');

        client.getMarketId('BTC', 'KRW')
            .then(market => ws.send('{\'event\':\'SUBSCRIBE_TICKER\',\'marketId\':' + market.content[0].id + '}'));

        client.getMarketId('BTC', 'EUR')
            .then(market => ws.send('{\'event\':\'SUBSCRIBE_TICKER\',\'marketId\':' + market.content[0].id + '}'));

        ws.on('close', function close() {
            console.log('disconnected');
        });

        ws.on('error', function error(e) {
            console.error('error occured', e);
        });

        ws.on('message', function incoming(data) {
            console.log(data);
        });
    });
}
);