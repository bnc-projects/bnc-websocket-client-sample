const WebSocket = require('ws');
const client = require('./client.js');

let requestId = 1;
const indices = [
    'cc7887e1-1c67-4de5-bfd0-28a999b0e62a', // BTC high frequency index
    '3692a276-66ec-4db6-a8d8-77bd2f10c7d0', // ETH high frequency index
    'e9b180a1-c921-4c89-8a87-b9c83a2779a9', // BBDX DeFi index
];

client.getBearerToken().then(response => {
    console.log(`token valid for ${response.expires_in} seconds`);

    const ws = new WebSocket('wss://ws.bravenewcoin.com?access_token=' + response.access_token, undefined, {});

    ws.onclose = function close(event) {
        console.log('[disconnected]');
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
        console.log(`[message] ${event.data}`);
    };

    ws.onopen = function open() {
        console.log('[connected]');

        // Send a PING every 60 seconds or so...
        const interval = setInterval(() => ws.send(JSON.stringify({
            event: 'PING',
            requestId: requestId++
        })), 60000);

        ws.on('close', () => clearInterval(interval));

        // Subscribe to the required indices.
        indices.forEach(index => ws.send(JSON.stringify({
            event: 'SUBSCRIBE_INDEX_TICKER',
            indexId: index,
            requestId: requestId++
        })));
    };
});
