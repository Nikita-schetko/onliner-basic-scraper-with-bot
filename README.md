
# onliner-basic-scraper-with-bot

A simple onliner basic scraper with bot;

Create a new app on Heroku: heroku create APPNAMEHERE --region eu
Add the puppeteer heroku buildpack: heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack
[Check that nodeJs buildpack added also!!!]
Deploy to Heroku: git push heroku master

To run it with the heroku, not to forget:
 heroku buildpacks:set jontewks/puppeteer (https://github.com/jontewks/puppeteer-heroku-buildpack  )