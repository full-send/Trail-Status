module.exports = {
    fixDate,
    formatDate
}
const moment = require('moment')
// Used to fix the updatedDate to the correct year

function fixDate(oldDate) {
    let currentDate = new Date()
    let currentMonth = currentDate.getMonth()
    let currentYear = currentDate.getFullYear()
    let oldMonth = oldDate.getMonth()
    if (oldMonth > currentMonth) {
        oldDate.setYear(currentYear - 1)
        return oldDate
    } else {
        oldDate.setYear(currentYear)
        return oldDate
    }
}

function formatDate(oldDate) {
    // https://momentjs.com/
    let newDate = moment(oldDate).format('llll')
    return newDate
}