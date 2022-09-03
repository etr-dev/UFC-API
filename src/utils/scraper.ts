import { NotFoundException } from '@nestjs/common';
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

async function startBrowser(debug = false) {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  if (debug) {
    page.on('console', (consoleObj) => {
      if (consoleObj.type() === 'log') {
        console.log(consoleObj.text());
      }
    });
  }
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

async function scrapeUfcPage(url: string) {
  //Launch Puppeteer and navigate to URL
  var current = new Date();
  const startTime = current.getSeconds();
  await page.goto(url);

  let ufcEvent: UfcEvent = await page.evaluate(async (): Promise<UfcEvent> => {
    console.log('START');
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
        link: 'NOT FOUND',
        isLive: false,
        isComplete: false,
        method: 'NOT FOUND',
        time: 'NOT FOUND',
        round: 0,
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
        DetailsObj.link = `${matchLinkNode.baseURI}#${matchLinkNode.value}`;
      }

      // return empty because if details can't be found something is wrong
      if (!detailsElement) return DetailsObj;

      const isLive = getSingleElementByClassName(
        detailsElement,
        'c-listing-fight__banner--live',
      );
      DetailsObj.isLive = !(window.getComputedStyle(isLive).display === 'none');

      DetailsObj.method = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text method',
        'NOT FOUND',
      );

      DetailsObj.time = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text time',
        'NOT FOUND',
      );

      DetailsObj.round = Number(
        getSingleElementTextContent(
          detailsElement,
          'c-listing-fight__result-text round',
          '0',
        ),
      );

      if (DetailsObj.round != 0) {
        DetailsObj.isComplete = true;
      }

      return DetailsObj;
    }

    function getFighterAttributes(
      fighter: Element,
      odds: string,
      side: string,
    ): UfcFighterInfo {
      let fighterObject: UfcFighterInfo = {
        name: '',
        odds: '',
        outcome: 'NOT FOUND' as Outcomes,
        image: '',
      };

      //Setup fighter's name
      const getFighterName = (fighter, side) => {
        const corner = getSingleElementByClassName(
          fighter,
          `c-listing-fight__corner-name c-listing-fight__corner-name--${side}`,
        );
        let fnameElement = getSingleElementByClassName(
          corner,
          'c-listing-fight__corner-given-name',
        );
        fnameElement = fnameElement ? fnameElement : corner;
        const firstName = fnameElement
          ? fnameElement.textContent.trim()
          : 'null';

        let lnameElement = getSingleElementByClassName(
          corner,
          'c-listing-fight__corner-family-name',
        );
        lnameElement = lnameElement ? lnameElement : corner;
        const lastName = lnameElement
          ? lnameElement.textContent.trim()
          : 'null';

        return firstName === lastName
          ? `${firstName}`
          : `${firstName} ${lastName}`;
      };

      const getFighterOutcome = (fighter, side) => {
        const corner = getSingleElementByClassName(
          fighter,
          `c-listing-fight__corner-body--${side}`,
        );

        const outcomeWrapper = getSingleElementByClassName(
          corner,
          'c-listing-fight__outcome-wrapper  ',
        );
        const outcome = outcomeWrapper
          ? outcomeWrapper.children[0].textContent
              .toUpperCase()
              .replace(/(\r\n|\n|\r)/gm, '')
              .trim()
          : '';
        return outcome as Outcomes;
      };

      const getImageOfFighter = (fighter, side) => {
        const corner = getSingleElementByClassName(
          fighter,
          `c-listing-fight__corner--${side}`,
        );
        if (!corner) {
          console.log('Could not find corner in getImageOfFighter');
          return null;
        }

        const imageElement = getSingleElementByClassName(
          corner,
          `image-style-event-fight-card-upper-body-of-standing-athlete`,
        );
        if (!imageElement) {
          console.log('Could not find imageElement in getImageOfFighter');
          return null;
        }

        const imageUrl = imageElement.getAttribute('src');
        if (!imageUrl) {
          console.log('Could not find imageUrl in getImageOfFighter');
          return null;
        }

        return imageUrl;
      }

      fighterObject.name = getFighterName(fighter, side);
      fighterObject.outcome = getFighterOutcome(fighter, side);
      fighterObject.image = getImageOfFighter(fighter, side);

      return fighterObject;
    }

    let data = {};

    //('c-listing-fight__banner--live hidden') if the fight isn't live ('c-listing-fight__banner--live') if it is live
    let matches = document.getElementsByClassName('l-listing__item');
    for (let match of matches) {
      const oddsElementList = match
        .getElementsByClassName('c-listing-fight__odds-row')[0]
        .getElementsByClassName('c-listing-fight__odds-amount');
      if (oddsElementList.length != 2) throw new NotFoundException();
      const redOdds = oddsElementList[0].textContent;
      const blueOdds = oddsElementList[1].textContent;

      const matchInfo: UfcMatchInfo = {
        details: getMatchDetails(match),
        Red: { ...getFighterAttributes(match, redOdds, 'red'), odds: redOdds },
        Blue: {
          ...getFighterAttributes(match, redOdds, 'blue'),
          odds: blueOdds,
        },
      };

      if (matchInfo.details.isComplete) {
        let result = '';
        if (matchInfo.Red.outcome === 'WIN') {
          result = 'RED'
        } else if (matchInfo.Blue.outcome === 'WIN') {
          result = 'BLUE';
        } else {
          result = matchInfo.Red.outcome;
        }
        matchInfo.details.result = result;
      }

      data[`${matchInfo.Red.name} vs ${matchInfo.Blue.name}`] = matchInfo;
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
    )[0].textContent.trim();
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
