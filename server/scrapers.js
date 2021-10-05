const puppeteer = require('puppeteer');

async function scrapeNextEvent(url) {
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
    await page.goto(eventLinks[0])
    let fightInfo = await page.evaluate(async () => {
        let data = [];

        //Store a list of all fighters first and last names
        let givenNames = document.getElementsByClassName('c-listing-fight__corner-given-name');
        let lastNames = document.getElementsByClassName('c-listing-fight__corner-family-name');
        let fighterOdds = document.getElementsByClassName('c-listing-fight__odds-amount');

        //Loop through all fights and create an array with objects including their names and odds
        for(let i = 0; i < givenNames.length-1; i+=2){
            fightTitle = lastNames[i].textContent + ' vs ' + lastNames[i+1].textContent
            let obj2 = {};
            obj2['Red'] =  {'Name': givenNames[i].textContent + ' ' +lastNames[i].textContent, 'Odds': fighterOdds[i].textContent};
            obj2['Blue'] = {'Name': givenNames[i+1].textContent + ' ' +lastNames[i+1].textContent, 'Odds': fighterOdds[i+1].textContent};

            let fightData = {}
            fightData[fightTitle] = obj2
            data.push(fightData);  
        }

        let obj = {};
        obj['eventTitle'] = window.location.pathname.split('/').pop();
        obj['date'] = document.getElementsByClassName('c-event-fight-card-broadcaster__time tz-change-inner')[0].textContent;
        obj['name'] = document.getElementsByClassName('field field--name-venue field--type-entity-reference field--label-hidden field__item')[0].textContent;
        obj['fights'] = data;
        return obj;
    });

    browser.close()
    return fightInfo    //Return JSON object with event info and all fights on the event
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

(async () => {
    //const data = await scrapePage('https://www.ufc.com/events')
    //console.log(data)
})();

module.exports = {
    scrapeNextEvent,
    scrapeEventUrls
}
