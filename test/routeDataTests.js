process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/bin/www');
var should = chai.should();

chai.use(chatHttp);

describe('Route Data', () => {
	describe('POST a route ID', () => {
	it('Should post a route ID and station ID' +
	 'and receive the server handling the route and the schedule of that stop from the current time', (done) => {
		let routeData = 	{
			route: "0",
			station: "0"
		}
		chai.request(server)
			.post('/routedata')
			.send(routeData)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('serverOfRoute');
				res.body.should.have.property('schedule');
				res.body.schedule.should.be.a('array');
				res.body.schedule.length.should.be.eql(2);
				for (var i = 0; i < res.body.schedule.length; i++) {
					res.body.schedule[i].should.have.property('route');
					res.body.schedule[i].route.should.be.eql(0);
					res.body.schedule[i].should.have.property('station');
					res.body.schedule[i].station.should.be.eql(0);
					res.body.schedule[i].should.have.property('arrivalTime');
				}
				done();
			});
		});
	});
	describe('POST a bad route ID', () => {
	it('Should post a bad route ID and receive a 400', (done) => {
		let routeData = 	{
			route: "-1",
			station: "0"
		}
		chai.request(server)
			.post('/routedata')
			.send(routeData)
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});
	describe('POST a bad station ID', () => {
	it('Should post a bad station ID and receive a 400', (done) => {
		let routeData = 	{
			route: "0",
			station: "-1"
		}
		chai.request(server)
			.post('/routedata')
			.send(routeData)
			.end((err, res) => {
				res.should.have.status(400);
				done();
			});
		});
	});
});
