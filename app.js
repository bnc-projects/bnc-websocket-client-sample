const ws = require('ws');
const request = require('request');

const client = require('./client.js');
const oauth2 = require('./oauth2');

request.post("https://auth.bravenewcoin.com/oauth/token", {
  json: true,
  body: oauth2
}, (err, res, body) => {
  if (err) {
    return console.log(err);
  }
  const ws = new ws('wss://ws.bravenewcoin.com?access_token=' + body.access_token, {});

  ws.on('open', async function open() {
    console.log('connected');
    ws.send("{'event':'PING'}");

    client.getMarketId('BTC', 'KRW')
    .then(market => ws.send("{'event':'SUBSCRIBE_TICKER','marketId':" + market.content[0].id + "}"));

    client.getMarketId('BTC', 'EUR')
    .then(market => ws.send("{'event':'SUBSCRIBE_TICKER','marketId':" + market.content[0].id + "}"));

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
});