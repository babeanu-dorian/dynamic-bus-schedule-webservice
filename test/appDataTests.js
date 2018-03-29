process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/bin/www');
var should = chai.should();

chai.use(chatHttp);

describe('App Data', () => {
	describe('GET general data about routes and stations', () => {
		it('it should get all general data about all routes and stations on the routes', (done) => {
			chai.request(server)
				.get('/appdata')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('mapRouteServer');
					res.body.mapRouteServer.should.have.property('r0');
					res.body.mapRouteServer.should.have.property('r1');
					res.body.should.have.property('stationRoutes');
					res.body.stationRoutes.should.be.a('array');
					//Testing script has 4 stations
					res.body.stationRoutes.length.should.be.eql(4);
					for (var i = 0; i < res.body.stationRoutes.length; i++) {
						res.body.stationRoutes[i].should.have.property('id');
						res.body.stationRoutes[i].should.have.property('name');
						res.body.stationRoutes[i].should.have.property('routes');
						res.body.stationRoutes[i].routes.should.be.a('array');
					}
					done();
				});
		});
	});
});