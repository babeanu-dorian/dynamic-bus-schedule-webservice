use DynamicBusSchedulingServer;

DELETE FROM Stations;

INSERT INTO Stations (Id, Name, AuthenticationKey) VALUES 
(0, 'Hoofdstation Groningen', '0000000000000000'),
(1, 'Zernike Campus', 'aaaaaaaaaaaaaaaa'),
(2, 'Paddepoel', '1111111111111111'),
(3, 'De Oosterpoort', 'bbbbbbbbbbbbbbbb');

DELETE FROM Routes;

INSERT INTO Routes (Id) VALUES 
(0),
(1);

DELETE FROM Buses;

INSERT INTO Buses (Id, Route, AuthenticationKey) VALUES 
(0, 0, '0000000000000000'),
(1, 0, 'aaaaaaaaaaaaaaaa'),
(2, 1, '1111111111111111'),
(3, 1, 'bbbbbbbbbbbbbbbb');

DELETE FROM StationsOnRoute;

INSERT INTO StationsOnRoute (Station, Route, Location, CurrentDelay) VALUES 
(0, 0, 0.0, 0),
(0, 1, 0.0, 0),
(1, 0, 0.5, 0),
(1, 1, 0.5, 0),
(2, 0, 0.75, 0),
(3, 1, 0.75, 0);

DELETE FROM ExpectedTimes;

INSERT INTO ExpectedTimes (Station, Route, Hour, Month, Duration) VALUES 
(0, 0, 0, 0, 300),
(0, 1, 0, 0, 400),
(1, 0, 0, 0, 600),
(1, 1, 0, 0, 600),
(2, 0, 0, 0, 400),
(3, 1, 0, 0, 500);

DELETE FROM RecordedTimes;