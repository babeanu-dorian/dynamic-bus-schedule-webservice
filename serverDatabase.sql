CREATE DATABASE DynamicBusSchedulingServer;

use DynamicBusSchedulingServer;

CREATE TABLE Stations(
	Id INT UNSIGNED NOT NULL,
	Key char(16) NOT NULL,      -- used to authenticte the timetable devices
	PRIMARY KEY (Id)
);

CREATE TABLE Routes(
	Id INT UNSIGNED NOT NULL,
	PRIMARY KEY (Id)
);

CREATE TABLE Bus(
	Id INT UNSIGNED NOT NULL,
	Route INT UNSIGNED,          -- busses can have 0 or 1 routes
	Key char(16) NOT NULL,       -- used to authenticte the timetable devices
	PRIMARY KEY (Id),
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE StationsOnRoute(
	Station INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,
	Order INT UNSIGNED NOT NULL,        -- the number of the station on the route
	CurrentDelay INT NOT NULL           -- negative values are allowed to represent when the bus is ahead of the schedule
	CONSTRAINT PK_StationsOnRoute PRIMARY KEY (Station, Route),
	FOREIGN KEY (Station) REFERENCES Stations(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ExpectedTimes(
	Station INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,
	Hour TINYINT UNSIGNED NOT NULL,     -- 1st hour of the time interval
	Month TINYINT UNSIGNED NOT NULL,
	Duration INT NOT NULL,              -- time to reach station from previous station
	CONSTRAINT PK_StationsOnRoute PRIMARY KEY (Station, Route, Hour, Month),
	FOREIGN KEY (Station) REFERENCES Stations(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ActualTimes(
	
	Bus INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,

);