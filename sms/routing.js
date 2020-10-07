const status = require('./status')
const db = require('../database/db')
const config = require('../config.json')
module.exports = {
    route
}

// Regex for detecting incoming messages. 
const hasArg = /status (\w.*)/

async function route(textObj) {
    let text = {
        tosAccepted: false,
        number: textObj.From,
        query: textObj.Body.toLowerCase()
    }
    // Check if User Exists, if so grabs user
    text.user = await isUser(text.number)
    // If User Doesn't Exist....
    if (!text.user) {
        // New User - Create & Send TOS
        console.log(`New User - Creating... ${text.number}`)
        let userCreate = await db.createUser(text.number)
        // Checking if user now exists...
        if (userCreate) {
            console.log(`Sending TOS to user ${text.number}`)
            let out = await sendTOS(text.number)
            // Check we updated DB
            if (out) {
                return out
            } else {
                console.log(`Error sending TOS to ${text.number}`)
            }
        } else {
            console.log(`Error creating user for ${text.number}`)
        }
    } else if (text.user && text.user.lastSentTos && text.query == 'y') {
        // User accepting TOS
        let updated = await db.updateTOS(text.number)
        console.log(updated)
        if (updated) {
            console.log(`Sucessfully updated TOS for user ${text.number}`)
            return `Sucessfully accepted TOS. You may now use our serivce. To get started send 'Status' or 'Status trailName'`
        } else {
            console.log(`Error while updating TOS for user ${text.number}`)
        }
    } else if (text.user && text.user.lastSentTos && text.query == 'n') {
        // User rejecting TOS
        return `Unfortunately we cannot serve you until you accept the TOS. Sorry.`
    } else if (text.user && !text.user.tos) {
        // I think this will be the general catch all. If User hasn't accepted. Or tried sending y when didn't send TOS
        // User has not yet accepted TOS and last message was not TOS, resending.
        let out = await sendTOS(text.number)
        if (out) {
            return out
        } else {
            console.log(`Error sending TOS to ${text.number}`)
        }
    } else if (text.user && text.user.tos) {
        // User has accepted TOS and exists time to process
        if (text.query === 'status') {
            console.log(`Matched to Status`)
            let curStatus = await status.statusCheck()
            return curStatus
        } else if (text.query.includes('status') && text.query.match(hasArg)) {
            // Message is Status <trailName> - Getting specific information
            console.log(`Message with Args: ${text.query}`)
            let arg = text.query.match(hasArg)[1]
            console.log(`Argument: ${arg}`)
            let out = await db.findTrail(arg)
            let status = 'closed'
            if (out.open) {
                status = 'open'
            }
            return `${out.name} is currently ${status} - Last Updated: ${out.lastUpdated}`
        } else if (text.query.includes('update')) {
            // Returns array of 3 groups - 1) trail 2) status 3) Notes
            const updateArg = /update (\w*) (\w*) ?(.*)/
            console.log('Matched to update')
            if (text.user.privledged) {
                console.log(`User ${text.number} authroized to update status`)
                let match = text.query.match(updateArg)
                let now = new Date()
                let args = {
                    name: match[1],
                    status: match[2],
                    open: false,
                    notes: match[3],
                    lastUpdated: now
                }
                console.log(args)
                if (args.name) {
                    console.log(`Trail ${args.name} Updating...`)
                    // Input Validation
                    if (args.status.toLowerCase() === 'open' || args.status.toLowerCase() === 'closed') {
                        if (args.status.toLowerCase() === 'open') {
                            args.open = true
                        }
                        let out = await db.updateStatus(args, text.user.name, args.notes)
                        console.log(`Sucessfully Updated status of ${args.name}`)
                        return `Sucessfully updated ${args.name} to ${args.status}`
                    }
                } else {
                    console.log(`No information provided, returning schema`)
                    return `Looks like you tried to update a trail but didn't provide a name. \n To update a trail, use the following style: 'update trailName status notes' with status being 'open' or 'closed'`
                }
            } else {
                console.log(`User ${text.number} not Authorized`)
                return `You are not authorized to update statuses. To learn more please visit <URL>`
            }
        } else {
            console.log(`${text.query} did not match any known routes`)
        }
    } else {
        // IDK how they got here but here is their object:
        console.log(`No user should be able to hit this...`)
        console.log(text)
    }
}

async function isUser(number) {
    let out = db.checkUser(number)
    if (out) {
        let outUser = db.findUser(number)
        return outUser
    } else {
        return null
    }
}

async function sendTOS(number) {
    let sent = await db.sentTOS(number)
    return config.sms.tos
}