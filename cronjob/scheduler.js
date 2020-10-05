const scrape = require('./scrape')

// Scheduling of every 10 minutes to grab status
const schedule = require('node-schedule')
var j = schedule.scheduleJob('* /10 * * * *', function()  {
  console.log(`Updating cache`)
  scrape.getData()
  
})