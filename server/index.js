const express = require('express');
const bodyparser = require('body-parser');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 900 });
const colors = require('colors');
const app = express();
const scrapers = require("./scrapers");
const e = require('express');
const port = 3000;


//elijah

app.use(bodyparser.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get('/api/v1/nextEvent', async (req, res) => {
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+ 'API request at: /nextEvent')
    if (cache.has('nextEvent')){
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Cache hit for nextEvent')
        return res.send(cache.get('nextEvent'));
    } else {
    try{
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+ 'Scraping...')
        const fightData = await scrapers.scrapeNextEvent('https://www.ufc.com/events')
        cache.set('nextEvent', fightData)
        res.send(fightData)
    }
    catch(err){
        console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+err)
        res.send({'Error' : 'Your specified url is not contained. Try using the /eventLinks feature to see available events'})
    }
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Success')
    //todo: get ufc odds
    }
});

app.get('/api/v1/eventLinks', async (req, res) => {
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'API request at: /eventLinks')
    if (cache.has('eventLinks')){
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Cache hit for eventLinks')
        return res.send(cache.get('eventLinks'));
    } else {
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Scraping...')
        try{
            const eventLinks = await scrapers.scrapeEventUrls('https://www.ufc.com/events')
            cache.set("eventLinks",eventLinks)
            res.send(eventLinks)
        }
        catch(err) {
            console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+err)
            cache.
            res.send({'Error' : 'Your specified url is not contained. Try using the /eventLinks feature to see available events'})
        }
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Success')
        //todo: get ufc odds
    }
});

app.get('/api/v1/allEvents', async (req, res) => { //SLOW
    //const eventLinks = await scrapers.scrapeEventUrls(req)
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'API request at: /allEvents')

    if (cache.has('allEvents')){
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Cache hit for allEvents')
        return res.send(cache.get('allEvents'));
    } else {
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Scraping...')
        try{
            const allEvents = await scrapers.scrapeAllUpcomingEvents('https://www.ufc.com/events')
            cache.set("allEvents",allEvents)
            res.send(allEvents)
        }
        catch(err){
            console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+err)
            res.send({'Error' : 'Your specified url is not contained. Try using the /eventLinks feature to see available events'})
        }
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Success')
    }
});

app.get('/api/v1/eventByLink', async (req, res) => { //SLOW
    //const eventLinks = await scrapers.scrapeEventUrls(req)
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'API request at: eventByLink')
    try{
        req.query.url;
    }  
    catch(err) {
        console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+'EventByLink had no url field in query')
        res.send({'Error' : 'Format your query like this `/eventByLink?url=https://www.ufc.com/event/ufc-268` you are recieving an error for no url query'})
    }

    if(cache.has(req.query.url.toLowerCase())){
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Cache hit for ' + req.query.url)
        return res.send(cache.get(req.query.url))
    } else {
        console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Scraping...')
        try{
            if(req.query.url.toLowerCase().indexOf('https://www.ufc.com/event/') == -1) 
            {
                console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+'EventLink was not a ufc link')
                throw 'not ufc link';
            }

            const event = await scrapers.scrapeByUrl(req.query.url)
            cache.set(req.query.url.toLowerCase(),event)      //Store the URL data in the Cache
            res.send(event)
            console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Success')
        }
        catch(err){
            console.error(colors.red('[' + new Date().toLocaleString() + ']    ' )+err)
            res.send({'Error' : 'Your specified url is not contained. Try using the /eventLinks feature to see available events'})
        }
    }
    //todo: get ufc odds
});

app.post('/api/v1/fight', async (req, res) => {
    console.log(req.body)
    //const fightData = await scrapers.scrapePage('https://sportsbook.draftkings.com/leagues/mma/88670562?category=fight-lines&subcategory=moneyline')
    //console.log({fightData})
    //todo: scrape
    //todo: Add to DB
});

app.listen(port, () => {
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+`UFC app listening at http://localhost:${port}`)
    console.log(colors.green('[' + new Date().toLocaleString() + ']    ' )+'Server Started.');
});
