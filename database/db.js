const {
    Sequelize,
    DataTypes,
    Model
} = require('sequelize');
const sequelize = new Sequelize(config.db.sqlAuth)
const {
    Op
} = require("sequelize");
const config = require('../config.json')
const date = require('../util/date')
// Exports
module.exports = {
    findUser,
    updateTOS,
    updateName,
    deleteUser,
    createTrail,
    findTrail,
    updateStatus,
    isExisting,
    allStatuses,
    checkUser,
    sentTOS,
    createUser
}

async function connect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
connect()
// UserDB
const User = sequelize.define('User', {
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    },
    privledged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    tos: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    lastSentTos: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email: {
        type: DataTypes.STRING
    },
    numRequests: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

// Trail Status DB
const trailStatus = sequelize.define('trailStatus', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    open: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false
    },
    prettyDate: {
        type: DataTypes.STRING
    },
    trailPage: {
        type: DataTypes.STRING
    },
    whoLastUpdated: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.STRING
    }
})

// Creates/Syncs tables
async function sync() {
    console.log('Syncing Databases....')
    await sequelize.sync()
    console.log('Succesfully synced databases')
}
sync()

// User DB //
// Create User
async function createUser(number) {
    let out = await User.create({
        phoneNumber: number
    })
    return out
}
// Checks if user exists 
async function checkUser(number) {
    let count = await User.count({
        where: {
            phoneNumber: number
        }
    })
    if (count != 0) {
        return true
    } else {
        return false
    }
}
// Updates that we sent TOS
async function sentTOS(number) {
    let sent = await User.update({
        lastSentTos: true
    }, {
        where: {
            phoneNumber: number
        }
    })

}

// Searches for a user based on phone number. If no user exists, creates one. 
async function findUser(number) {
    let user = await User.findAll({
        where: {
            phoneNumber: number
        },
        raw: true
    })
    if (user) {
        return user[0]
    }
}
// Update user's TOS status
async function updateTOS(number) {
    let user = await findUser(number)
    if (user.lastSentTos) {
        // Last Message we sent was TOS
        console.log(`Updating TOS -- Last message was TOS`)
        await User.update({
            tos: true
        }, {
            where: {
                phoneNumber: number
            }
        })
        return true
    } else {
        // Last Message was NOT TOS
        console.log(`NOT Updating TOS -- Last message was NOT TOS`)
        return
    }
}
// Update user's name
async function updateName(user) {
    await User.update({
        name: user.name
    }, {
        where: {
            phoneNumber: user.number
        }
    })
}
// Delete User
async function deleteUser(number) {
    await User.destroy({
        where: {
            phoneNumber: number
        }
    })
}

// Trail DB //
// Store Status (Should only run once)
async function createTrail(trail) {
    let out = await trailStatus.create({
        name: trail.name,
        open: trail.open,
        lastUpdated: trail.lastUpdated,
        prettyDate: date.formatDate(trail.lastUpdated)
    })
    return out
}

// Does Trail entry exist?
async function isExisting(trailName) {
    return trailStatus.count({
        where: {
            name: trailName
        }
    }).then(count => {
        if (count != 0) {
            return true
        } else {
            return false
        }
    })
}

// Find Trail
async function findTrail(trailName) {

    let trail = await trailStatus.findAll({
        where: {
            name: {
                [Op.iLike]: `${trailName}%`
            }
        },
        raw: true
    })
    trail = trail[0]
    if (!trail.name) {
        console.log(`No Trail exists called ${trailName}`)
        return false
    } else {
        console.log(`Found data for ${trail.name}`)
        return trail
    }
}

// Update Status
async function updateStatus(trail, user, notes) {
    // Check which data is more recent
    let curValue = await findTrail(trail.name)
    if (curValue.lastUpdated > trail.lastUpdated) {
        console.log(`DB has more recent information that TMTB`)
    } else {
        let status = await trailStatus.update({
            open: trail.open,
            lastUpdated: trail.lastUpdated,
            whoLastUpdated: user,
            notes: notes,
            prettyDate: date.formatDate(trail.lastUpdated)
        }, {
            where: {
                name: {
                    [Op.iLike]: `${trail.name}%`
                }
            },
            raw: true
        })
        return status
    }
}

// Get all trail statuses
async function allStatuses() {
    let out = await trailStatus.findAll({
        raw: true
    })
    return out
}
