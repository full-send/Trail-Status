const db = require('../database/db.js')
const dateLogic = require('../util/date')

module.exports = {
    getData
}
const config = require('../config.json')
const request = require("request-promise");
const cheerio = require("cheerio");
const url = config.db.web.url
const backupURL = config.db.web.backupURL
const apiURL = config.db.web.apiURL

// Sends request to defined URL to grab the status
async function getData() {
    // // Definiting Return-object
    // let status = {
    //   siteStatus: "UP",
    //   statusArr: []
    // }

    // // Request to TMTB
    // const result = await request.get(url).catch(function (err) {
    //   status.siteStatus = 'DOWN'
    //   console.log(err)
    // });
    // const $ = cheerio.load(result);

    // // Temp Arrays
    // let nameArr = []
    // let statusArr = []
    // let updatedArr = []

    // // Last Updated Selector
    // $(`body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > span`).each((index, element) => {
    //     let text = $(element).text()
    //     text = new Date(text)
    //     // Some date logic
    //     let newDate = dateLogic.fixDate(text)
    //     updatedArr.push(newDate)
    // });
    // // Park Name Selector
    // $("body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > li > a").each((index, element) => {
    //     let text = $(element).text()
    //     text = text.replace(/ └ /g, 'Briar Chapel - ') 
    //     nameArr.push(text)
    // });
    // // Status Selector
    // $(`body > table:nth-child(2) > tbody > tr > td:nth-child(3) > table > tbody > tr > td > b > span`).each((index, element) => {
    //   let text = $(element).text()
    //   text = text.replace(/ /g, '')
    //   statusArr.push(text)
    // });

    // //Iterating through the data and sorting it into object >> Array
    // nameArr.forEach(function (element, i) {
    //   let thing = {}
    //   thing.name = element
    //   thing.status = statusArr[i]
    //   thing.updated = updatedArr[i]
    //   status.statusArr.push(thing)
    // });

    // New get from unoffical API
    const result = await request.get(apiURL).catch(function (err) {
        // status.siteStatus = 'DOWN'
        console.log(err)
    });
    const parsedResult = JSON.parse(result)


    // Store into DB
    parsedResult.data.forEach(status => {
        let isOpen = false
        if (status.status === "open") {
            isOpen = true
        }
        let newDate = new Date(status.last_updated)
        let trail = {
            name: status.trail,
            open: isOpen,
            lastUpdated: dateLogic.fixDate(newDate),
        }

        // Checks to see if Trail Exists (Should only do once...)
        db.isExisting(trail.name).then(exists => {
            if (exists) {
                db.updateStatus(trail, 'TMTB')
                console.log(`Updated Trail ${trail.name}`)
            } else {
                db.createTrail(trail)
                console.log(`Created Trail ${trail.name}`)
            }
        })
    });
    // I don't think we need to return anything anymore here?
    // return (status)
}