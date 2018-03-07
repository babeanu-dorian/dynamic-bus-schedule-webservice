CREATE DATABASE DynamicBusSchedulingServer;

use DynamicBusSchedulingServer;

CREATE TABLE Stations(
	Id INT UNSIGNED NOT NULL,
	AuthenticationKey CHAR(16) NOT NULL,      -- used to authenticte the timetable devices
	PRIMARY KEY (Id)
);

CREATE TABLE Routes(
	Id INT UNSIGNED NOT NULL,
	PRIMARY KEY (Id)
);

CREATE TABLE Buses(
	Id INT UNSIGNED NOT NULL,
	Route INT UNSIGNED,                        -- busses can have 0 or 1 routes
	AuthenticationKey CHAR(16) NOT NULL,       -- used to authenticte the vehicle
	PRIMARY KEY (Id),
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE StationsOnRoute(
	Station INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,
	Location FLOAT(4, 4) UNSIGNED NOT NULL,    -- dist(routeStart, stationLocation)/ routeLength
	CurrentDelay INT NOT NULL,                  -- negative values are allowed to represent when the bus is ahead of the schedule
	CONSTRAINT PK_StationsOnRoute PRIMARY KEY (Station, Route),
	FOREIGN KEY (Station) REFERENCES Stations(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ExpectedTimes(
	Station INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,
	Hour TINYINT UNSIGNED NOT NULL,            -- 1st hour of the time interval
	Month TINYINT UNSIGNED NOT NULL,
	Duration INT NOT NULL,                     -- time to reach station from previous station
	CONSTRAINT PK_StationsOnRoute PRIMARY KEY (Station, Route, Hour, Month),
	FOREIGN KEY (Station) REFERENCES Stations(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE RecordedTimes(
	Id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	Bus INT UNSIGNED NOT NULL,
	Route INT UNSIGNED NOT NULL,
	Progress FLOAT(4, 4) UNSIGNED NOT NULL,
	TimeOfRecord DATETIME NOT NULL,
	PRIMARY KEY (Id),
	FOREIGN KEY (Bus) REFERENCES Buses(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Route) REFERENCES Routes(Id) ON DELETE CASCADE ON UPDATE CASCADE
);