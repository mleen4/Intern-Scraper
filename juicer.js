const puppeteer = require('puppeteer')
const fs = require('fs/promises');
const { IncomingMessage } = require('http');
const testListing = '#post-23622 > div > div > div > div > div > div > ul > li > a > div > h3'
const paginationSelector = "#post-23622 > div > div > div > div > div > div.job_listings > nav > ul > li"
const formSelector = "#search_categories";
const checkForm = '//*[@id="post-23622"]/div/div[2]/div/div/div/div[3]/form/div[1]/div[4]/span/span[1]/span/ul/li/input'
const resultsFoundSelector = '#post-23622 > div > div.fusion-fullwidth.fullwidth-box.fusion-builder-row-3.nonhundred-percent-fullwidth.non-hundred-percent-height-scrolling > div > div > div > div.job_listings > form > div.showing_jobs.wp-job-manager-showing-all > span';
const listing = '#post-23622 > div > div.fusion-fullwidth.fullwidth-box.fusion-builder-row-3.nonhundred-percent-fullwidth.non-hundred-percent-height-scrolling > div > div > div > div.job_listings > ul > li.post-68426.job_listing.type-job_listing.status-publish.hentry.job_listing_tag-deakintalent-jobs-board.job-residency-not-specified.job-type-internships > a > div.position > h3'
const volunteerCheckbox = '#job_type_volunteering'
const jobsCheckbox = '#job_type_jobs'
const lastChild = "#post-23622 > div > div.fusion-fullwidth.fullwidth-box.fusion-builder-row-3.nonhundred-percent-fullwidth.non-hundred-percent-height-scrolling > div > div > div > div.job_listings > nav > ul > li:last-child"

const testJuice = "#post-23622 > div > div.fusion-fullwidth.fullwidth-box.fusion-builder-row-3.nonhundred-percent-fullwidth.non-hundred-percent-height-scrolling > div > div > div > div.job_listings > nav > ul > li:nth-child(2) > a"
async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://deakintalent.deakin.edu.au/jobs-and-internships/')

    const pageHeading = await page.$eval("#job-aggregator", (element) => {
        return element.textContent;
    })
    console.log(pageHeading);

    //Text can input and then press the enter key to submit, just entering the text doesn't work.

    await formInput(formSelector, page)
    await tickCheckbox(volunteerCheckbox, jobsCheckbox, page)
    await resultsFound(resultsFoundSelector, page)
    await findListings(testListing, lastChild, page)

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
            await page.click(lastChild)
            await page.waitForSelector(selector, {visible: true})
        }
        
    }
    console.log(listingsFinal.join());
    
    //oi 
    // boobie
    //oi 2
}
start()

