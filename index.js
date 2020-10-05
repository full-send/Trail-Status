// index.js
const getData = require('./cronjob/scrape.js')
const web = require('./web/web.js')
const sms = require('./sms/smsHandling.js')
const scheduler = require('./cronjob/scheduler')
// Call once to populate the DB
getData.getData()

const date = require('./util/date')
let now = new Date()
date.formatDate(now)