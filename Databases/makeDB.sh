#!/bin/bash

# Script to set up MySQL database

read -p "Database name (must coincide with the name of the .sql file): " nameDB
read -p "Username for the new user: " user
read -sp "Password for the new user: " pass
read -sp "$(echo -e '\nMySQL password for root@localhost: ')" rootpass

# create database and user
mysql -uroot -p${rootpass} < ${nameDB}.sql
mysql -uroot -p${rootpass} -e "CREATE USER ${user}@localhost IDENTIFIED BY '${pass}';GRANT ALL PRIVILEGES ON ${nameDB}.* TO '${user}'@'localhost';FLUSH PRIVILEGES;"
