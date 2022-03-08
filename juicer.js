const puppeteer = require('puppeteer')
const fs = require('fs/promises');
const { IncomingMessage } = require('http');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require('./client-secret.json')
const selector = require('./selectors.json');

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
    await tickCheckbox(selector.volunteerCheckbox, selector.jobsCheckbox, selector.listing, page)

    // Added a Modal, so this is a temporary work around (lines 28-30).
    await page.waitForSelector(selector.modalCloseSelector, {visible: true})
    await page.click(selector.modalCloseSelector)
    await page.waitForSelector(selector.modalCloseSelector, {hidden: true})

    await resultsFound(selector.resultsFoundSelector, page)
    await page.screenshot({path: "testscreenshot.png"})
    await findListings(selector.listing, selector.pagination, page)
    await browser.close()

}

async function formInput(selector, page) {
    await page.type(selector, 'Computing & Information Systems');
    await page.keyboard.press('Enter')
}

async function tickCheckbox(checkboxOne, checkboxTwo, listing, page) {
    await page.click(checkboxOne)
    await page.click(checkboxTwo)
    await page.waitForSelector(listing)
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

async function AccessSpreadsheet(listingsArray)
{
    //Connecting and Authorizing Spreadsheet
    await doc.useServiceAccountAuth({
        client_email: creds.client_email,
        private_key: creds.private_key,
    });
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0] // Which sheet we are actually using

    // If Spreadsheet reset is required, run this line and disable QuerySheet()
    // await PostToSheet(sheet, listingsArray)
    await QuerySheet(sheet, listingsArray)
}

async function PostToSheet(sheet, listingsArray)
{
    const rows = await sheet.getRows();
    for(let i = 0; i <= listingsArray.length; i++)
    {
        const rows = await sheet.addRow({Title: listingsArray[i]})
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

async function QuerySheet(sheet, listingsArray)
{
    let date = new Date();
    let queryArray = await sheet.getRows()
    let testArray = []
    for(let i = 0; i <= queryArray.length; i++)
    {
        if(queryArray[i] != null)
        {
            testArray.push(queryArray[i].Title)
        }       
    }
    for(let j = 0; j < listingsArray.length; j++)
    {
        if(!testArray.includes(listingsArray[j]))
        {
            console.log("New Listing Added: " + listingsArray[j])
            const rows = await sheet.addRow({Title: listingsArray[j], Date_Scraped: date.toLocaleDateString()})
        }
    }
}

start()

