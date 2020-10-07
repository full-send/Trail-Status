const db = require('../database/db.js')
const dateLogic = require('../util/date')

module.exports = {
    getData
}
const config = require('../config.json')
const request = require("request-promise");
const cheerio = require("cheerio");
const url = config.web.url
const backupURL = config.web.backupURL
const apiURL = config.web.apiURL

// Sends request to defined URL to grab the status
async function getData() {
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