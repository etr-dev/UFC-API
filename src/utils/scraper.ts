import { match } from 'assert';
import { assert } from 'console';
import { UfcEvent } from 'src/ufc/models/entities/event.entity';
import { UfcMatchDetails } from 'src/ufc/models/interfaces/matchDetails.interface';

const puppeteer = require('puppeteer');

async function scrapeUfcPage(url: string, nextEvent: boolean = false) {
  //Launch Puppeteer and navigate to URL
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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

  let fightInfo: UfcEvent = await page.evaluate(async () => {
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

    function getMatchDetails(match: Element) {
        let DetailsObj = {};
      const detailsElement = getSingleElementByClassName(
        match,
        'c-listing-fight__details',
      );

      const matchLinkNode = getSingleElementByClassName(
        match,
        'c-listing-fight',
      ).attributes[1];
      matchLinkNode.name === 'data-fmid'
        ? (DetailsObj[
            'Link'
          ] = `${matchLinkNode.baseURI}#${matchLinkNode.value}`)
        : (DetailsObj['Link'] = '');

      // return empty because if details can't be found something is wrong
      if (!detailsElement) return DetailsObj;

      const isLive = getSingleElementByClassName(
        detailsElement,
        'c-listing-fight__banner--live',
      );
      DetailsObj['isLive'] = !(
        window.getComputedStyle(isLive).display === 'none'
      );

      DetailsObj['Method'] = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text method',
        'NOT FOUND',
      );

      DetailsObj['Time'] = getSingleElementTextContent(
        detailsElement,
        'c-listing-fight__result-text time',
        'NOT FOUND',
      );

      DetailsObj['Round'] = Number(
        getSingleElementTextContent(
          detailsElement,
          'c-listing-fight__result-text round',
          '0',
        ),
      );

      return DetailsObj;
    }

    function getFighterAttributes(fighter: Element, odds: string) {
      let fighterObject = {
        Name: '',
        Odds: '',
        Outcome: '',
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

      fighterObject['Name'] = `${firstName} ${lastName}`;

      fighterObject['Odds'] = odds;

      const outcomeWrapper = getSingleElementByClassName(
        fighter,
        'c-listing-fight__outcome-wrapper  ',
      );
      const outcome = outcomeWrapper
        ? outcomeWrapper.children[0].textContent
            .toLowerCase()
            .replace(/(\r\n|\n|\r)/gm, '')
            .trim()
        : '';
      fighterObject['Outcome'] = outcome;

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

      data[
        `${redName ? redName.textContent : 'null'} vs ${
          blueName ? blueName.textContent : 'null'
        }`
      ] = {
        Details: getMatchDetails(match),
        Red: getFighterAttributes(redCorner, redOdds),
        Blue: getFighterAttributes(blueCorner, blueOdds),
      };
    }

    //CREATING THE OBJECT THAT GETS RETURNED
    let obj = {};

    //Get URL and clean it up into a title
    obj['eventTitle'] = window.location.pathname
      .split('/')
      .pop()
      .replaceAll('-', ' ')
      .toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ')
      .replace('Ufc', 'UFC');
    obj['url'] = window.location.href;
    obj['date'] = document.getElementsByClassName(
      'c-event-fight-card-broadcaster__time tz-change-inner',
    )[0].textContent;
    try {
      const imageLink =
        document.getElementsByTagName('SOURCE')[0].attributes[0].value;
      obj['image'] = imageLink.substring(0, imageLink.indexOf(' '));
    } catch (err) {
      obj['image'] = 'https://wallpaperaccess.com/full/2241952.jpg';
    }
    obj['fights'] = data;
    return obj;
  });

  browser.close();
  return fightInfo; //Return JSON object with event info and all fights on the event
}

export { scrapeUfcPage };
