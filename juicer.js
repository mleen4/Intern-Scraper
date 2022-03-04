const puppeteer = require('puppeteer')
const fs = require('fs/promises');
const { IncomingMessage } = require('http');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require('./client-secret.json')
const selector = require('./selectors.json')

const doc = new GoogleSpreadsheet('1ZRfUEe3PxUVPoyz7nZByH4y1xKjGQjq3UFXDh-twKj8'); //Initializing Sheet

async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://deakintalent.deakin.edu.au/jobs-and-internships/')

    const pageHeading = await page.$eval("#job-aggregator", (element) => {
        return element.textContent;
    })
    console.log(pageHeading);

    await formInput(selector.formSelector, page)
    await tickCheckbox(selector.volunteerCheckbox, selector.jobsCheckbox, page)
    await resultsFound(selector.resultsFoundSelector, page)
    await findListings(selector.listing, selector.pagination, page)

    await browser.close()
}

async function formInput(selector, page) {
    await page.type(selector, 'Computing & Information Systems');
    await page.keyboard.press('Enter')
}

async function tickCheckbox(checkboxOne, checkboxTwo, page) {
    await page.click(checkboxOne)
    await page.click(checkboxTwo)
}

async function resultsFound(selector, page) {
    await page.waitForSelector(selector);
    const resultsFound = await page.$eval(selector, element => element.textContent);
    console.log(resultsFound);
}

async function findListings(selector, paginationSelector, page) {
    let listingsFinal = []
    let done = false
    while (done == false) {
        listingsFinal.push(await page.$$eval(selector, (listings) => {
            return listings.map(x => x.textContent)
        }))

        const paginationNew = await page.$eval(paginationSelector, el => el.textContent)
        if (paginationNew != '→') {
            console.log("Last Page :) Yay!")
            done = true
        }
        else {
            console.log(paginationNew);
            await page.click(paginationSelector)
            await page.waitForSelector(selector, {visible: true})
        }     
    }
    let tempArray = []
    listingsFinal.forEach((listing) => {
        tempArray = tempArray.concat(listing)
    })

    console.log(tempArray);
    // console.log(listingsFinal);

    AccessSpreadsheet(tempArray);
    
}

async function AccessSpreadsheet(ListingsArray)
{
    let formattedArray = [{}]
    //Connecting and Authorizing Spreadsheet
    await doc.useServiceAccountAuth({
        client_email: creds.client_email,
        private_key: creds.private_key,
    });
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0] // Which sheet we are actually using

    const rows = await sheet.getRows();
    for(let i = 0; i <= ListingsArray.length; i++)
    {
        const rows = await sheet.addRow({Title: ListingsArray[i]})
    }

    //Nope dumb
    // ListingsArray.forEach(listing => {
    //     listing = formattedArray.title;
    //     console.log(formattedArray.title);
    // })

    // Didn't work as expected.
    // ListingsArray.forEach(async listing => {
    //     const thisRow = await sheet.addRow({Title: listing});
    // })

}

start()

