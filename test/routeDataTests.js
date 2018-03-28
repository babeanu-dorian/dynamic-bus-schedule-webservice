process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/app');
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
			.post('/busData')
			.send(busData)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('serverOfRoute');
				res.body.should.have.property('schedule');
				res.body.schedule.should.be.a('array');
				res.body.schedule.length.should.be.eql(2);
				for (var i = 0; i < res.body.schedule.length; i++) {
					res.body.schedule[i].should.have.property('route');
					res.body.schedule[i].should.have.property('station');
					res.body.schedule[i].should.have.property('secondsToArrival');
				}
				done();
			});
		});
	});
});