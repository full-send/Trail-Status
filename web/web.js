// Requires
const express = require("express");
const path = require("path");
const config = require("../config.json")
const db = require('../database/db')

// Const Vars
const app = express();
const port = process.env.PORT || config.web.port || "8080";

// App Config
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

// Web-Server Routing
app.get("/", async (req, res) => {

    db.allStatuses().then(output => {
        // console.log(output)
        output.forEach(status => {
            if (status.open) {
                status.open = 'open'
            } else {
                status.open = 'closed'
            }
        });
        res.render("index", {
            statusOutput: output
        });
    })
});

// Opening server 
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});