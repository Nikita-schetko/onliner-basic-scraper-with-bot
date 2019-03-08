// load in puppeteer
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const options = {
  headless: false,
  // update ignored scripts/files
  blacklist: [
    /.*collector\.githubapp.*/,
  ]
}

const scrapedData = [];

const writeFileInterceptor = (blacklist) => (e) => {
  if(blacklist.find(item => item.test(e.url))) {
    e.abort();
  }else {
    e.continue();
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
    page.on('request', writeFileInterceptor(options.blacklist));

    

    // navigate to a website
    await page.goto('https://baraholka.onliner.by/search.php?q=macbook+pro&f=&cat=0&topicTitle=1&start=0')

    // grab onliner data
    const pageContent = await page.content();
    var $ = cheerio.load(pageContent);
    $('table.ba-tbl-list__table tr').each(function(i, element){
      var txtBlock = $(element).find('div.txt-i').eq(0);
      var titleBlock = $(txtBlock).find('h2.wraptxt').eq(0);
      var title = titleBlock.text();
      var url = titleBlock.children().eq(0).attr('href');
      var desc = $(txtBlock).find('td p+p').eq(0).text();
      var author = $(txtBlock).find('p.ba-signature a').eq(0).text();
      var city = $(txtBlock).find('p.ba-signature strong').eq(0).text();
      var price = $(element).find('td.cost div').eq(0).text();
      var time = $(element).find('td.post-tls p.ba-post-up').eq(0).text();

      // var rank = a.parent().parent().text();
      // var title = a.text();
      // var url = a.attr('href');
      // var subtext = a.parent().parent().next().children('.subtext').children();
      // var points = $(subtext).eq(0).text();
      // var username = $(subtext).eq(1).text();
      // var comments = $(subtext).eq(2).text();
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

      // console.log(parsedMessage);
      scrapedData.push(parsedMessage);
      }
      
    });

    console.log($('table.ba-tbl-list__table tr').length)

 //#endregion

    // const teams = await page.evaluate(() => {
    //   // a helper function for some slight code reuse
    //   // grab the TD, the text and remove trailing whitespace
    //   const grabFromRow = (row, classname) => row
    //     .querySelector(`td.${classname}`)
    //     .innerText
    //     .trim()

    //   // our selectors
    //   const TEAM_ROW_SELECTOR = 'tr.team'

    //   // we'll store our data in an array of objects
    //   const data = []

    //   // get all team rows
    //   const teamRows = document.querySelectorAll(TEAM_ROW_SELECTOR)

    //   // loop over each team row, creating objects
    //   for (const tr of teamRows) {
    //     data.push({
    //       name: grabFromRow(tr, 'name'),
    //       year: grabFromRow(tr, 'year'),
    //       wins: grabFromRow(tr, 'wins'),
    //       losses: grabFromRow(tr, 'losses')
    //     })
    //   }

    //   // send the data back into the teams variable
    //   return data
    // })

    // log the data for testing purposes
    // console.log(JSON.stringify(teams, null, 2))

    // output
    // [
    //   {
    //     "name": "Boston Bruins",
    //     "year": "1990",
    //     "wins": "44",
    //     "losses": "24"
    //   },
    //   {
    //     "name": "Buffalo Sabres",
    //     "year": "1990",
    //     "wins": "31",
    //     "losses": "30"
    //   },

    //   ...etc
    // ]

    // save the data as JSON
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
