// load in puppeteer
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { performance } = require('perf_hooks');

const DEFAULT_STEP = 25;

const startTime = performance.now();

const options = {
  headless: true,
  amountOfScrapedAds: 100,
  // update ignored scripts/files
  blacklist: [
    /.\.*.yandex.\.*/,
    /.\.*.google.\.*/,
  ]
}

const scrapedData = [];

const writeFileInterceptor = (blacklist) => (req) => {
  // test for additional resources to load;
  if (blacklist.find(item => item.test(req.url))) {
    req.abort();
  }
  // skip loading css,fonts,images 
  if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
    req.abort();
  }
  else {
    req.continue();
  }
}

// this wrapper means immediately execute this code
void (async () => {
  // wrapper to catch errors
  try {
    // create a new browser instance
    const browser = await puppeteer.launch({headless: true})

    // create a page inside the browser
    const page = await browser.newPage();
    page.setRequestInterception(true);
    page.setJavaScriptEnabled(false);
    page.on('request', writeFileInterceptor(options.blacklist));

    // async grabbing function
    async function scrapeOnlinerData() {
      for (let i = 0; i <= options.amountOfScrapedAds; i+= DEFAULT_STEP ) {

      // grab onliner data
      await page.goto('https://baraholka.onliner.by/search.php?q=macbook+pro&f=&cat=1&topicTitle=1&start=' + i)
      const pageContent = await page.content();
      var $ = cheerio.load(pageContent);
      // console.log($('table.ba-tbl-list__table tr').length)

      $('table.ba-tbl-list__table tr').each(function (i, element) {
        var txtBlock = $(element).find('div.txt-i').eq(0);
        var titleBlock = $(txtBlock).find('h2.wraptxt').eq(0);
        var title = titleBlock.text();
        var url = titleBlock.children().eq(0).attr('href');
        var desc = $(txtBlock).find('td p+p').eq(0).text();
        var author = $(txtBlock).find('p.ba-signature a').eq(0).text();
        var city = $(txtBlock).find('p.ba-signature strong').eq(0).text();
        var price = $(element).find('td.cost div').eq(0).text();
        var time = $(element).find('td.post-tls p.ba-post-up').eq(0).text();

        if (title.length > 0 && time.length > 0) {
          var parsedMessage = {
            title: title,
            desc: desc,
            city: city,
            author: author,
            url: url,
            time: time.trim(),
            price: price.substring(0, price.indexOf(',')),
          };

          scrapedData.push(parsedMessage);
          
        }
      });
      console.log(`Scraped ${i + DEFAULT_STEP} so far...`)
      }
  }

  await scrapeOnlinerData();

    // save the data as JSON
    const endTime = performance.now();
    console.log("Scraping tooked " + Math.round(endTime - startTime)/1000 + " seconds.");

    const fs = require('fs')
    console.log(scrapedData.length);
    fs.writeFile(
      './json/teams.json',
      JSON.stringify(scrapedData, null, 2), // optional params to format it nicely
      (err) => err ? console.error('Data not written!', err) : console.log('Data written!')
    )

    // all done, close this browser
    await browser.close()
  } catch (error) {
    // if something goes wrong
    // display the error message in console
    console.log(error)
  }
})()
