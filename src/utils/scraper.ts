import { match } from 'assert';
import { assert } from 'console';
import { UfcEvent } from 'src/ufc/models/entities/event.entity';
import { Outcomes } from 'src/ufc/models/enums/outcome.enum';
import { UfcFighterInfo } from 'src/ufc/models/interfaces/fighterInfor.interface';
import { UfcMatchDetails } from 'src/ufc/models/interfaces/matchDetails.interface';
import { UfcMatchInfo } from 'src/ufc/models/interfaces/matchInfo.interface';
import { logError, logServer } from './log';

const puppeteer = require('puppeteer');
let browser, page;

async function startBrowser() {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
}

async function getAllEventLinks(url: string) {
  await page.goto(url);
  //Get each event element and store the link to the event pages in eventLinks array
  let eventLinks = await page.evaluate(async () => {
    let data = [];
    let events = document.querySelectorAll('[class*=result__headline]');
    for (var event of events) data.push(event.childNodes[0]['href']);

    return data;
  });

  return eventLinks;
}

async function scrapeUfcPage(url: string, nextEvent: boolean = false) {
  //Launch Puppeteer and navigate to URL
  var current = new Date();
  const startTime = current.getSeconds();

  await page.goto(url);
  if (nextEvent) {
    //Get each event element and store the link to the event pages in eventLinks array
    let eventLinks = await page.evaluate(async () => {
      let data = [];
      let events = document.querySelectorAll('[class*=result__headline]');
      for (var event of events) data.push(event.childNodes[0]['href']);

      return data;
    });
    //Navigate to next event page
    await page.goto(eventLinks[0]);
  }

  let ufcEvent: UfcEvent = await page.evaluate(async (): Promise<UfcEvent> => {
    function getSingleElementByClassName(
      htmlElement: Element,
      className: string,
    ) {
      const elements = htmlElement.getElementsByClassName(className);
      return elements.length > 0 ? elements[0] : null;
    }

    function getSingleElementTextContent(
      htmlElement: Element,
      className: string,
      replacementText = 'null',
    ) {
      const elements = htmlElement.getElementsByClassName(className);
      return elements.length > 0 ? elements[0].textContent : replacementText;
    }

    function getMatchDetails(match: Element): UfcMatchDetails {
      let DetailsObj: UfcMatchDetails = {
        Link: 'NOT FOUND',
        isLive: false,
        Method: 'NOT FOUND',
        Time: 'NOT FOUND',
        Round: 0,
      };

      const detailsElement = getSingleElementByClassName(
        match,
        'c-listing-fight__details',
      );

      const matchLinkNode = getSingleElementByClassName(
        match,
        'c-listing-fight',
      ).attributes[1];

      if (matchLinkNode.name === 'data-fmid') {
        DetailsObj.Link = `${matchLinkNode.baseURI}#${matchLinkNode.value}`;
      }

      // return empty because if details can't be found something is wrong
      if (!detailsElement) return DetailsObj;

      const isLive = getSingleElementByClassName(
        detailsElement,
        'c-listing-fight__banner--live',
      );
      DetailsObj.isLive = !(window.getComputedStyle(isLive).display === 'none');

      DetailsObj.Method = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text method',
        'NOT FOUND',
      );

      DetailsObj.Time = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text time',
        'NOT FOUND',
      );

      DetailsObj.Round = Number(
        getSingleElementTextContent(
          detailsElement,
          'c-listing-fight__result-text round',
          '0',
        ),
      );

      return DetailsObj;
    }

    function getFighterAttributes(
      fighter: Element,
      odds: string,
    ): UfcFighterInfo {
      let fighterObject: UfcFighterInfo = {
        Name: '',
        Odds: '',
        Outcome: 'NOT FOUND' as Outcomes,
      };

      //Setup fighter's name
      const firstName = getSingleElementTextContent(
        fighter,
        'c-listing-fight__corner-given-name',
        'null',
      );
      const lastName = getSingleElementTextContent(
        fighter,
        'c-listing-fight__corner-family-name',
        'null',
      );

      fighterObject.Name = `${firstName} ${lastName}`;
      fighterObject.Odds = odds;

      const outcomeWrapper = getSingleElementByClassName(
        fighter,
        'c-listing-fight__outcome-wrapper  ',
      );
      const outcome = outcomeWrapper
        ? outcomeWrapper.children[0].textContent
            .toUpperCase()
            .replace(/(\r\n|\n|\r)/gm, '')
            .trim()
        : '';
      fighterObject.Outcome = outcome as Outcomes;

      return fighterObject;
    }

    let data = {};

    //('c-listing-fight__banner--live hidden') if the fight isn't live ('c-listing-fight__banner--live') if it is live
    let matches = document.getElementsByClassName('l-listing__item');
    for (let match of matches) {
      const redCorner = getSingleElementByClassName(
        match,
        'c-listing-fight__corner-body--red',
      );
      const blueCorner = getSingleElementByClassName(
        match,
        'c-listing-fight__corner-body--blue',
      );

      const redName = getSingleElementByClassName(
        redCorner,
        'c-listing-fight__corner-family-name',
      );
      const blueName = getSingleElementByClassName(
        blueCorner,
        'c-listing-fight__corner-family-name',
      );

      const oddsElementList = match
        .getElementsByClassName('c-listing-fight__odds')[0]
        .getElementsByClassName('c-listing-fight__odds-amount');
      //THROW ERROR IF LIST LENGTH != 2
      const redOdds = oddsElementList[0].textContent;
      const blueOdds = oddsElementList[1].textContent;

      const matchInfo: UfcMatchInfo = {
        Details: getMatchDetails(match),
        Red: getFighterAttributes(redCorner, redOdds),
        Blue: getFighterAttributes(blueCorner, blueOdds),
      };

      data[`${matchInfo.Red.Name} vs ${matchInfo.Blue.Name}`] = matchInfo;
    }

    //CREATING THE OBJECT THAT GETS RETURNED
    let ufcEvent: UfcEvent = {
      eventTitle: '',
      url: '',
      date: '',
      image: '',
      fights: data,
    };

    //Get URL and clean it up into a title
    ufcEvent.eventTitle = window.location.pathname
      .split('/')
      .pop()
      .replaceAll('-', ' ')
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
      .replace('Ufc', 'UFC');
    ufcEvent.url = window.location.href;
    ufcEvent.date = document.getElementsByClassName(
      'c-event-fight-card-broadcaster__time tz-change-inner',
    )[0].textContent;
    try {
      const imageLink =
        document.getElementsByTagName('SOURCE')[0].attributes[0].value;
      ufcEvent.image = imageLink.substring(0, imageLink.indexOf(' '));
    } catch (err) {
      ufcEvent.image = 'https://wallpaperaccess.com/full/2241952.jpg';
    }
    return ufcEvent;
  });

  var current = new Date();
  logServer(
    `Page Scraped in ${current.getSeconds() - startTime} seconds.`,
    'clock1',
  );
  return ufcEvent; //Return JSON object with event info and all fights on the event
}

export { scrapeUfcPage, startBrowser, getAllEventLinks };
