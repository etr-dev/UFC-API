const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const scrapers = require("./scrapers");
const port = 3000;


//elijah
app.use(bodyparser.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get('/nextEvent', async (req, res) => {
    const fightData = await scrapers.scrapeNextEvent('https://www.ufc.com/events')
    res.send(fightData)
    //todo: get ufc odds
});

app.get('/eventLinks', async (req, res) => {
    const eventLinks = await scrapers.scrapeEventUrls('https://www.ufc.com/events')
    res.send(eventLinks)
    //todo: get ufc odds
});

app.get('/eventByLink', async (req, res) => {
    //const eventLinks = await scrapers.scrapeEventUrls(req)
    res.send(eventLinks)
    //todo: get ufc odds
});

app.post('/fight', async (req, res) => {
    console.log(req.body)
    //const fightData = await scrapers.scrapePage('https://sportsbook.draftkings.com/leagues/mma/88670562?category=fight-lines&subcategory=moneyline')
    //console.log({fightData})
    //todo: scrape
    //todo: Add to DB
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
