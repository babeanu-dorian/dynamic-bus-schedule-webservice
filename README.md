[![Build Status](https://travis-ci.org/babeanu-dorian/dynamic-bus-schedule-webservice.svg?branch=master)](https://travis-ci.org/babeanu-dorian/dynamic-bus-schedule-webservice)
[![Coverage Status](https://coveralls.io/repos/github/babeanu-dorian/dynamic-bus-schedule-webservice/badge.svg?branch=master)](https://coveralls.io/github/babeanu-dorian/dynamic-bus-schedule-webservice?branch=master)

# Dynamic Bus Schedule Webservice

## Synopsis
This project is an application which monitors a public transport system and dynamically generates and serves accurate schedules and expected arrival times.  

## Motivation

This project was created for the course "Net Computing" at the University of Groningen.

## Setup

### Database: To set up a database on a new machine

./Databases/makeDB.sh
and provide: 

     1. the name of the database (ex: DynamicBusSchedulingServer)

     2. the username used by the application

     3. the password used by the application

     4. the root password for the local MySQL Server

Alternatively, without the script run:

echo -e "<1>\n<2>\n<3>\n<4>\n" | ./Databases/makeDB.sh

We included two sql files with dummy data for testing and demontration purposes. These can be found in ./Databases/DB_Mock_Contents/ To load them into the database do the following (with 2 and 3 as above):

mqsql -u<2> -p<3> < ./Databases/DB_Mock_Contents/map1.sql

or

mqsql -u<2> -p<3> < ./Databases/DB_Mock_Contents/map2.sql

map2.sql has more data than map1.sql, however map1.sql MUST be loaded if you want to run your tests locally.

### Node Servers : To start server after cloning
Ensure the environment variables MY_SQL_USER and MY_SQL_PASS are set. They must match the ones you used when creating the database (2 and 3 on the list above). You can set them with:

export MY_SQL_USER=<2>

export MY_SQL_PASS=<3>

sudo npm install

npm start

If you want to add more servers to the cluster, you must open a new terminal, make sure your environment variable are set, and set another environment variable SPAWN to the address of a running server and run npm start. To assist you with this a prompt will be printed when you start a server that you can copy and paste.

### App
The Web App can be accessed by visiting the address of any of the running servers. When you start a server it will print its address.

### Tests
Once database has been setup and the environment variables have been set run:

npm test

The tests ensure all possible http requests that can be made to the server function correctly, code coverage is also outputted.

## Contributors
Ashton Spina

Alexandru Babeanu

Alexander Daffurn-Lewis

## License

MIT
