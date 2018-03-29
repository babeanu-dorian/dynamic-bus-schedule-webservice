[![Build Status](https://travis-ci.org/babeanu-dorian/dynamic-bus-schedule-webservice.svg?branch=master)](https://travis-ci.org/babeanu-dorian/dynamic-bus-schedule-webservice)
[![Coverage Status](https://coveralls.io/repos/github/babeanu-dorian/dynamic-bus-schedule-webservice/badge.svg?branch=master)](https://coveralls.io/github/babeanu-dorian/dynamic-bus-schedule-webservice?branch=master)

# Dynamic Bus Schedule Webservice

## Synopsis
This project is an application which monitors a public transport system and dynamically generates and serves accurate schedules and expected arrival times.  

## Motivation

This project was created for the course "Net Computing" at the University of Groningen.

## Setup

### Node Servers : To start server after cloning
sudo npm install

npm start

### Database: To set up a database on a new machine

./Databases/makeDB.sh
and provide: 

     1. the name of the database (ex: DynamicBusSchedulingServer)

     2. the username used by the application

     3. the password used by the application

     4. the root password for the local MySQL Server

Alternatively, when using a script:

echo -e "<1>\n<2>\n<3>\n<4>\n" | ./Databases/makeDB.sh

### App
Not created yet

### Tests
Once database has been setup:
npm test

The tests ensure all possible http requests that can be made to the server function correctly

## Contributors
Ashton Spina

Alexandru Babeanu

Alexander Daffurn-Lewis

## License

MIT
