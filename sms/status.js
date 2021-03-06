module.exports = {
    statusCheck
}
const config = require('../config.json')
const db = require('../database/db')
const url = config.web.url
const backupURL = config.web.backupURL


async function statusCheck() {
    console.log(`Checking Status...`)
    let data = await db.allStatuses()
    let open = 0
    let total = 0
    data.forEach(status => {
      total++
      if (status.open) {
        open++
      } else {
        return
      }
    });
    console.log(`There is (${open}/${total}) parks currently opened. For a full list please see ${url}`)
    return `There is (${open}/${total}) parks currently opened. For a full list please see ${url} or it's mirror ${backupURL}`
  }