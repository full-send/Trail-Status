# Trail-Status

## Original Purpose

The main purpose of this project was to make a proof-of-concept mirror site for a local trail status website. Due to the original site having hosting/coding issues, this site utilizes an unoffical API to get the statuses of local trail systems (Open/Closed/LastUpdated/etc) and mirrors these on a PUG site. 

The core code here can be used for other trail systems to mirror sites if they have an external API that can be plugged into. Alternatively, you can utilize a scraper using some of the code found here:

< Insert Scraping Link after Scraping Issue is filled.

Additionally, as a pet project, I also explored a trail status updating/status system using SMS. This is useful for park rangers or other riders to easily update statuses and get updates to their phones when mobile-date service may not be available. 

## Config

< Fill out as doing Config Issue

##### Database

The code should automatically setup a database if given the correct credentials in the config file under db.sqlAuth.

We are using sequelize (With Postgres) to manage CRUD operations here, so the auth string would be similar to:

`const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // Example for postgres`

Further documentation can be found here:
https://sequelize.org/master/manual/getting-started.html

## SMS

The SMS service is comprised of the Twilio SMS Service found here:

https://www.twilio.com/

More documentation regarding this service can be found in their quick-guide here:

https://www.twilio.com/docs/sms/quickstart/node

##### Routing

Currently all incoming SMS messages are read, routed through a large cascading if-statement and then read from or update the Database. 

## Future Thoughts
