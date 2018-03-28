process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/app');
var should = chai.should();

chai.use(chatHttp);

/*describe('GET index', () => {
	it('it should GET the index', (done) => {
		chai.request(server)
			.get('/')
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});*/

describe('App Data', () => {
	describe('GET general data about routes and stations', (done) => {
		chai.request(server)
		.get('/appData')
		.end((err, res) => {
			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.should.have.property('mapRouteServer');
			res.body.mapRouteServer.should.have.property('r0');
			res.body.mapRouteServer.should.have.property('r1');
			res.body.should.have.property('stationRoutes');
			res.body.stationRoutes.should.be.a('array');
			res.body.stationRoutes.length.should.be.eql(2);
			for (var i = 0; i < res.body.stationRoutes.length; i++) {
				res.body.stationRoutes[i].should.have.property('id');
				res.body.stationRoutes[i].should.have.property('name');
				res.body.stationRoutes[i].should.have.property('routes');
				res.body.stationRoutes[i].routes.should.be.a('array');
			}
			done();
	});
});