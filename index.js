// load in puppeteer

const TelegramBot = require('node-telegram-bot-api');
const dedent = require('dedent');
const fs = require('fs');
const scraper = require('./scraper');

const ONLINER_BASE_URL = 'https://baraholka.onliner.by/';

try {
  var tgToken = JSON.parse(fs.readFileSync('config.json', 'utf8')).telegramBotToken;
} catch (error) {
  console.log('Error: Please define tgToken');
}

console.log(tgToken);

var scrapedData = [];

scraper.scrape(true);

setInterval(() => {
  scraper.scrape(true).then((data)=>{
    scrapedData = data;
  });
}, 30000);


var bot = new TelegramBot(tgToken, {polling: true});

bot.onText(/\/start/, function (msg, match) {
    var chatId = msg.chat.id;
    launchAdsSender(chatId);
    bot.sendMessage(chatId, 'Sending ads started...');
});

bot.onText(/\/showOnlinerAd/, function (msg, match) {
  var chatId = msg.chat.id;
  // var resp = match[1] ? match[1] : 25 ;
  bot.sendMessage(chatId, 'recieved');
});

// Простая команда без параметров.
bot.on('message', function (msg) {
    bot.sendMessage(msg.chat.id, 'Received your message');
    // Фотография может быть: путь к файлу, поток(stream) или параметр file_id
    // var photo = 'cats.png';
    // bot.sendPhoto(chatId, photo, {caption: 'Милые котята'});
});

function launchAdsSender(chatId) {
  var currentInterval = setInterval(() => {
    if (scrapedData.length == 24) clearInterval(currentInterval);
    let currentAd = scrapedData.shift();
    let msg = dedent(
      `<a href="${ONLINER_BASE_URL + currentAd.url}">${currentAd.title}</a>  <b>${currentAd.price}</b>
    ${currentAd.desc}
    ${currentAd.author}`);
    bot.sendMessage(chatId, msg, {parse_mode: 'HTML', disable_web_page_preview: true});
  }, 1000);
  
}


