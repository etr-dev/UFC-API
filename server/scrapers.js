const puppeteer = require('puppeteer');

async function scrapeNextEvent(url) {
    //Launch Puppeteer and navigate to URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    //Get each event element and store the link to the event pages in eventLinks array
    let eventLinks = await page.evaluate(async () => {
        let data = [];      
        let events = document.querySelectorAll("[class*=result__headline]")
        for (var event of events)
            data.push(event.childNodes[0].href);
        
        return data;
        //eventLink = events[0].childNodes[0].href;
    });


    //Navigate to next event page
    await page.goto(eventLinks[0])
    let fightInfo = await page.evaluate(async () => {
        let data = {};

        //('c-listing-fight__banner--live hidden') if the fight isn't live ('c-listing-fight__banner--live') if it is live

        //Store a list of all fighters first and last names
        let givenNames = document.getElementsByClassName('c-listing-fight__corner-given-name');
        let lastNames = document.getElementsByClassName('c-listing-fight__corner-family-name');
        let fighterOdds = document.getElementsByClassName('c-listing-fight__odds-amount');
        let outcomeList = document.getElementsByClassName('c-listing-fight__outcome-wrapper  ');
        let outcome = [];
        for (let res of outcomeList){
            outcome.push(res.childNodes[1].textContent)
        }
        let method = document.getElementsByClassName('c-listing-fight__result-text method');
        let time = document.getElementsByClassName('c-listing-fight__result-text time');
        let round = document.getElementsByClassName('c-listing-fight__result-text round');

        //Loop through all fights and create an array with objects including their names and odds
        for(let i = 0; i < givenNames.length-1; i+=2){
            fightTitle = lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent
            let obj2 = {};
            obj2['OutcomeInfo'] = {'method': method[i].textContent, 'time': time[i].textContent,'round': round[i].textContent};
            obj2['Red'] =  {'Name': givenNames[i].textContent + ' ' +lastNames[i].textContent, 'Odds': fighterOdds[i].textContent, 'Outcome' : outcome[i].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};
            obj2['Blue'] = {'Name': givenNames[i+1].textContent + ' ' +lastNames[i+1].textContent, 'Odds': fighterOdds[i+1].textContent, 'Outcome': outcome[i+1].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};

            let fightData = {}
            data[fightTitle] = obj2
            //data.push(fightData);  
        }

        //CREATING THE OBJECT THAT GETS RETURNED
        let obj = {};

        //Get URL and clean it up into a title
        obj['eventTitle'] = window.location.pathname.split('/').pop().replaceAll('-',' ').toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ').replace('Ufc','UFC');
        obj['url'] = window.location.href
        obj['date'] = document.getElementsByClassName('c-event-fight-card-broadcaster__time tz-change-inner')[0].textContent;
        try{
        obj['image'] = document.getElementsByClassName('c-hero__image')[1].getAttribute('src')
        } catch(err) {
            obj['image'] = 'https://wallpaperaccess.com/full/2241952.jpg'
        }
        obj['fights'] = data;
        return obj;
    });

    browser.close()
    return fightInfo    //Return JSON object with event info and all fights on the event
}

async function scrapeAllUpcomingEvents(url) {
    //Launch Puppeteer and navigate to URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)


    //Get each event element and store the link to the event pages in eventLinks array
    let eventLinks = await page.evaluate(async () => {
        let data = [];
        let events = document.getElementsByClassName('c-card-event--result__headline')
        for (var event of events)
            data.push(event.childNodes[0].href);
        
        return data;
        //eventLink = events[0].childNodes[0].href;
    });


    //Navigate to next event page

    var ufcEvents = {};

    for(let i = 0; i < eventLinks.length; i++){

        await page.goto(eventLinks[i])
        let fightInfo = await page.evaluate(async () => {
            let data = [];

            //Store a list of all fighters first and last names
            let givenNames = document.getElementsByClassName('c-listing-fight__corner-given-name');
            let lastNames = document.getElementsByClassName('c-listing-fight__corner-family-name');
            let fighterOdds = document.getElementsByClassName('c-listing-fight__odds-amount');
            let outcomeList = document.getElementsByClassName('c-listing-fight__outcome-wrapper  ');
            let outcome = [];
            for (let res of outcomeList){
                outcome.push(res.childNodes[1].textContent)
            }
            let method = document.getElementsByClassName('c-listing-fight__result-text method');
            let time = document.getElementsByClassName('c-listing-fight__result-text time');
            let round = document.getElementsByClassName('c-listing-fight__result-text round');
            
            //Loop through all fights and create an array with objects including their names and odds
            for(let i = 0; i < givenNames.length-1; i+=2){
                fightTitle = lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent
                let obj2 = {};
                obj2['OutcomeInfo'] = {'method': method[i/2].textContent, 'time': time[i/2].textContent,'round': round[i/2].textContent};
                obj2['Red'] =  {'Name': givenNames[i].textContent + ' ' +lastNames[i].textContent, 'Odds': fighterOdds[i].textContent, 'Outcome' : outcome[i].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};
                obj2['Blue'] = {'Name': givenNames[i+1].textContent + ' ' +lastNames[i+1].textContent, 'Odds': fighterOdds[i+1].textContent, 'Outcome': outcome[i+1].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};

                let fightData = {}
                fightData[fightTitle] = obj2
                data.push(fightData);  
            }

            //CREATING THE OBJECT THAT GETS RETURNED
            let obj = {};

            //Get URL and clean it up into a title
            obj['eventTitle'] = window.location.pathname.split('/').pop().replaceAll('-',' ').toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ').replace('Ufc','UFC');
            obj['url'] = window.location.href
            obj['date'] = document.getElementsByClassName('c-event-fight-card-broadcaster__time tz-change-inner')[0].textContent;
            try{
            obj['image'] = document.getElementsByClassName('c-hero__image')[1].getAttribute('src')
            } catch(err) {
                obj['image'] = 'https://wallpaperaccess.com/full/2241952.jpg'
            }
            obj['fights'] = data;
            
            return [obj,window.location.href];
        });
        //URL: FightInfo ............. you can search for the event by url in the api
        ufcEvents[fightInfo[1]] = fightInfo[0]    
    }
    browser.close()
    return ufcEvents   //Return JSON object with event info and all Events
}

async function scrapeEventUrls(url) {
    //Launch Puppeteer and navigate to URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)


    //Get each event element and store the link to the event pages in eventLinks array
    let eventLinks = await page.evaluate(async () => {
        let data = [];
        let events = document.getElementsByClassName('c-card-event--result__headline')
        for (var event of events)
            data.push(event.childNodes[0].href);
        
        return data;
        //eventLink = events[0].childNodes[0].href;
    });

    return eventLinks;
}

async function scrapeByUrl(url) {
    //Launch Puppeteer and navigate to URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    let fightInfo = await page.evaluate(async () => {
        let data = [];

        //Store a list of all fighters first and last names
        let givenNames = document.getElementsByClassName('c-listing-fight__corner-given-name');
        let lastNames = document.getElementsByClassName('c-listing-fight__corner-family-name');
        let fighterOdds = document.getElementsByClassName('c-listing-fight__odds-amount');
        let outcomeList = document.getElementsByClassName('c-listing-fight__outcome-wrapper  ');
        let outcome = [];
        for (let res of outcomeList){
            outcome.push(res.childNodes[1].textContent)
        }
        let method = document.getElementsByClassName('c-listing-fight__result-text method');
        let time = document.getElementsByClassName('c-listing-fight__result-text time');
        let round = document.getElementsByClassName('c-listing-fight__result-text round');

        //Loop through all fights and create an array with objects including their names and odds
        for(let i = 0; i < givenNames.length-1; i+=2){
            fightTitle = lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent

            let obj2 = {};
            obj2['OutcomeInfo'] = {'method': method[i/2].textContent, 'time': time[i/2].textContent,'round': round[i/2].textContent};
            obj2['Red'] =  {'Name': givenNames[i].textContent + ' ' +lastNames[i].textContent, 'Odds': fighterOdds[i].textContent, 'Outcome' : outcome[i].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};
            obj2['Blue'] = {'Name': givenNames[i+1].textContent + ' ' +lastNames[i+1].textContent, 'Odds': fighterOdds[i+1].textContent, 'Outcome': outcome[i+1].toLowerCase().replace(/(\r\n|\n|\r)/gm, "").trim()};

            let fightData = {}
            fightData[fightTitle] = obj2
            data.push(fightData);  
        }

        //CREATING THE OBJECT THAT GETS RETURNED
        let obj = {};

        //Get URL and clean it up into a title
        obj['eventTitle'] = window.location.pathname.split('/').pop().replaceAll('-',' ').toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ').replace('Ufc','UFC');
        obj['url'] = window.location.href
        obj['date'] = document.getElementsByClassName('c-event-fight-card-broadcaster__time tz-change-inner')[0].textContent;
        try{
        obj['image'] = document.getElementsByClassName('c-hero__image')[1].getAttribute('src')
        } catch(err) {
            obj['image'] = 'https://wallpaperaccess.com/full/2241952.jpg'
        }
        obj['fights'] = data;
        return obj;
    });

    browser.close()
    return fightInfo    //Return JSON object with event info and all fights on the event
}

async function scrapeLiveEvent(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    let liveInfo = await page.evaluate(async () => {
        let liveFights = document.getElementsByClassName('c-listing-fight__banner--live')
        let lastNames = document.getElementsByClassName('c-listing-fight__corner-family-name');
        let data = {}
        
        for(let i = 0; i < lastNames.length; i+=2){
            if (liveFights[i/2].className == "c-listing-fight__banner--live")
                data[lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent] = true
            else
                data[lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent] = false
        }
        return data
    });
    return liveInfo
}

(async () => {
    //const data = await scrapeLiveEvent('https://www.ufc.com/event/ufc-fight-night-october-09-2021')
    //console.log(data)
})();

module.exports = {
    scrapeNextEvent,
    scrapeEventUrls,
    scrapeAllUpcomingEvents,
    scrapeByUrl,
    scrapeLiveEvent
}
