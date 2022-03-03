const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const {GoogleSpreadsheet} = require('google-spreadsheet');



async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://learnwebcode.github.io/practice-requests/')
    
    const names = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".info strong")).map(x => x.textContent)
    })
    console.log('evaluate - ' + names);
    await fs.writeFile("names.txt", names.join("\r\n"))

    const namesThree = await page.$eval(".info strong", (element) => {
        // return element.map(z => z.textContent)
        return element.textContent
    })
    console.log('$eval - ' + namesThree)

    const namesTwo = await page.$$eval(".info strong", (element) => {
        return element.map(y => y.textContent)
    })
    console.log('$$eval - ' + namesTwo)

    


    

    await page.click('#clickme')
    const clickedData  = await page.$eval("#data", el => el.textContent)
    console.log(clickedData);


    const photos = await page.$$eval('img', (imgs) => {
        return imgs.map(x => x.src)
    })

    for (const photo of photos)
    {
        const imagepage = await page.goto(photo)
        await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    }
    await browser.close()
}


start()