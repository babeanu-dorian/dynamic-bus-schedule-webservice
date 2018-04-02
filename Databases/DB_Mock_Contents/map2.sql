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
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9);

DELETE FROM Buses;

INSERT INTO Buses (Id, Route, AuthenticationKey) VALUES 
(0, 0, '0000000000000000'),
(1, 0, 'aaaaaaaaaaaaaaaa'),
(2, 1, '1111111111111111'),
(3, 1, 'bbbbbbbbbbbbbbbb'),
(4, 2, '0000000000000000'),
(5, 3, 'aaaaaaaaaaaaaaaa'),
(6, 4, '1111111111111111'),
(7, 5, 'bbbbbbbbbbbbbbbb'),
(8, 6, '0000000000000000'),
(9, 7, 'aaaaaaaaaaaaaaaa'),
(10, 8, '1111111111111111'),
(11, 9, 'bbbbbbbbbbbbbbbb');

DELETE FROM StationsOnRoute;

INSERT INTO StationsOnRoute (Station, Route, Location, CurrentDelay) VALUES 
(0, 0, 0.0, 0),
(0, 1, 0.0, 0),
(1, 0, 0.5, 0),
(1, 1, 0.5, 0),
(2, 0, 0.0, 0),
(3, 1, 0.0, 0),
(0, 2, 0.0, 0),
(0, 3, 0.0, 0),
(0, 4, 0.0, 0),
(0, 5, 0.0, 0),
(0, 6, 0.0, 0),
(0, 7, 0.0, 0),
(0, 8, 0.0, 0),
(0, 9, 0.0, 0),
(1, 2, 0.5, 0),
(1, 3, 0.5, 0),
(1, 4, 0.75, 0),
(1, 5, 0.9, 0),
(1, 6, 0.2, 0),
(1, 7, 0.5, 0),
(1, 8, 0.34, 0),
(1, 9, 0.1, 0),
(2, 5, 0.95, 0),
(2, 6, 0.78, 0);

DELETE FROM ExpectedTimes;

INSERT INTO ExpectedTimes (Station, Route, Hour, Month, Duration) VALUES 
(0, 0, 0, 0, 300),
(0, 1, 0, 0, 400),
(1, 0, 0, 0, 600),
(1, 1, 0, 0, 600),
(2, 0, 0, 0, 400),
(3, 1, 0, 0, 500),
(0, 2, 0, 0, 500),
(0, 3, 0, 0, 500),
(0, 4, 0, 0, 500),
(0, 5, 0, 0, 500),
(0, 6, 0, 0, 500),
(0, 7, 0, 0, 500),
(0, 8, 0, 0, 500),
(0, 9, 0, 0, 500),
(1, 2, 0, 0, 500),
(1, 3, 0, 0, 500),
(1, 4, 0, 0, 500),
(1, 5, 0, 0, 500),
(1, 6, 0, 0, 500),
(1, 7, 0, 0, 500),
(1, 8, 0, 0, 500),
(1, 9, 0, 0, 500),
(2, 5, 0, 0, 500),
(2, 6, 0, 0, 500);

DELETE FROM RecordedTimes;