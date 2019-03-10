// load in puppeteer
const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

const TelegramBot = require('node-telegram-bot-api');
const dedent = require('dedent');
const fs = require('fs');
const scraper = require('./scraper');

const ONLINER_BASE_URL = 'https://baraholka.onliner.by/';

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  if(scrapedData) {
    res.json({ scrapedDataLength: scrapedData.length,
    lastAd: JSON.stringify(scrapedData[scrapedData.length-1])
    }); 
  } 
  else res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, '0.0.0.0', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

var tgToken = process.env.TOKEN;
// try {
//   var tgToken = JSON.parse(fs.readFileSync('config.json', 'utf8')).telegramBotToken;
// } catch (error) {
//   console.log('Error: Please define tgToken in config.json (Probably, file is not exists');
// }

console.log(tgToken);

var scrapedData = [];
var usersToNotify = [];

scraper.scrape({writeToJson: false});

setInterval(() => {
  scraper.scrape({ writeToJson: false }).then((data) => {
    scrapedData = data;
    notifyUsersAboutNewAD();
  });
}, 450000);


var bot = new TelegramBot(tgToken, { polling: true });

bot.onText(/\/start/, function (msg, match) {
  var chatId = msg.chat.id;
  if (usersToNotify.includes(chatId)) bot.sendMessage(chatId, 'Already started for user: ' + chatId);
  else {
    usersToNotify.push(chatId);
    bot.sendMessage(chatId, 'Sending ads started... user: ' + chatId);
  }
});

bot.onText(/\/stop/, function (msg, match) {
  var chatId = msg.chat.id;
  if (usersToNotify.includes(chatId)) {
    usersToNotify.splice(usersToNotify.indexOf(chatId), 1);
    bot.sendMessage(chatId, 'Sending ads stopped for user: ' + chatId + ' ;');
  }
  else {
    bot.sendMessage(chatId, 'Ads for user already stopped;');
  }

});

bot.onText(/\/showOnlinerAd/, function (msg, match) {
  var chatId = msg.chat.id;
  // var resp = match[1] ? match[1] : 25 ;
  bot.sendMessage(chatId, 'recieved');
});

// Простая команда без параметров.
// bot.on('message', function (msg) {
//     bot.sendMessage(msg.chat.id, 'Received your message');
//     // Фотография может быть: путь к файлу, поток(stream) или параметр file_id
//     // var photo = 'cats.png';
//     // bot.sendPhoto(chatId, photo, {caption: 'Милые котята'});
// });

function notifyUsersAboutNewAD() {
  if(usersToNotify.length === 0 || scrapedData.length === 0) return;

  for (let i = 0; i < scrapedData.length; i++) {
    var currentAd = scrapedData[i];
    for (let u = 0; u < usersToNotify.length; u++) {
      var chatId = usersToNotify[u];
      let msg = dedent(
        `<a href="${ONLINER_BASE_URL + currentAd.url}">${currentAd.title}</a>  <b>${currentAd.price}</b>
    ${currentAd.desc}
    ${currentAd.author}`);
      bot.sendMessage(chatId, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
  }
}

// function launchAdsSender(chatId) {
//   var currentInterval = setInterval(() => {
//     if (scrapedData.length == 24) clearInterval(currentInterval);
//     let currentAd = scrapedData.shift();
//     let msg = dedent(
//       `<a href="${ONLINER_BASE_URL + currentAd.url}">${currentAd.title}</a>  <b>${currentAd.price}</b>
//     ${currentAd.desc}
//     ${currentAd.author}`);
//     bot.sendMessage(chatId, msg, {parse_mode: 'HTML', disable_web_page_preview: true});
//   }, 1000);
  
// }


