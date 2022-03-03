const {GoogleSpreadsheet} = require('google-spreadsheet');
const { promisify } = require('util');

const creds = require('./client-secret.json')

const doc = new GoogleSpreadsheet('1ZRfUEe3PxUVPoyz7nZByH4y1xKjGQjq3UFXDh-twKj8');
async function accessSpreadsheet() {
    await doc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key,
    });
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0]
    console.log(sheet.title)

    // const showRows = await sheet.getRows({offset: 1})
    // console.log(showRows);
    const thisRow = await sheet.addRow({Title: "no", lastscraped: "oi"});
}
accessSpreadsheet()