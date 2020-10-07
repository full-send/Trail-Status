// Using the getData() function found in cronjob/scrape.js 
// you can convert this into a scrape function vs a API function using the code found below:

// Definiting Return-object
let status = {
  siteStatus: "UP",
  statusArr: []
}

// Request to TMTB
const result = await request.get(url).catch(function (err) {
  status.siteStatus = 'DOWN'
  console.log(err)
});
const $ = cheerio.load(result);

// Temp Arrays
let nameArr = []
let statusArr = []
let updatedArr = []

// Last Updated Selector - Specific To TMTB
$(`body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > span`).each((index, element) => {
  let text = $(element).text()
  text = new Date(text)
  // Some date logic
  let newDate = dateLogic.fixDate(text)
  updatedArr.push(newDate)
});
// Park Name Selector - Specific To TMTB
$("body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > li > a").each((index, element) => {
  let text = $(element).text()
  text = text.replace(/ └ /g, 'Briar Chapel - ')
  nameArr.push(text)
});
// Status Selector - Specific To TMTB
$(`body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > b > span`).each((index, element) => {
  let text = $(element).text()
  text = text.replace(/ /g, '')
  statusArr.push(text)
});

//Iterating through the data and sorting it into object >> Array
nameArr.forEach(function (element, i) {
  let thing = {}
  thing.name = element
  thing.status = statusArr[i]
  thing.updated = updatedArr[i]
  status.statusArr.push(thing)
});