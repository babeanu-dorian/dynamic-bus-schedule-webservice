process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/bin/www');
var should = chai.should();

chai.use(chatHttp);

describe('Bus Data', () => {
	describe('POST bus data', () => {
	it('Should send bus data to server and receive the ID of the route the bus is on and the ID of the server handling its data', (done) => {
		let busData = 	{
			id: "0",
			key: "0000000000000000",
			route: "0",
			progress: "0.0"
		}
		chai.request(server)
			.post('/busdata')
			.send(busData)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('route');
				res.body.should.have.property('serverOfRoute');
				done();
			});
		});
	});
	describe('POST bus data with bad fields', () => {
		it('Should send bus data with bad fields to server and receive Bad Request Message', (done) => {
			let busData = 	{
				badId: '0'
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with invalid ID value', () => {
		it('Should send bus data with invalid ID and receive Bad Request', (done) => {
			let busData = 	{
				id: "a",
				key: "0000000000000000",
				route: "0",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with invalid key value', () => {
		it('Should send bus data with invalid key and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "1",
				route: "0",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with invalid route value', () => {
		it('Should send bus data with invalid route and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "0000000000000000",
				route: "bad",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with invalid progress value', () => {
		it('Should send bus data with invalid progress value and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "0000000000000000",
				route: "bad",
				progress: "666.666"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with ID not in database', () => {
		it('Should send bus data with invalid route and receive Bad Request', (done) => {
			let busData = 	{
				id: "1",
				key: "0000000000000000",
				route: "0",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with key not matching ID', () => {
		it('Should send bus data with invalid route and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "0000000000000001",
				route: "0",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with key not matching ID not in database', () => {
		it('Should send bus data with route that doesnt exist and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "0000000000000001",
				route: "1",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
	describe('POST bus data with SQL injection', () => {
		it('Should send bus data with SQL injection and receive Bad Request', (done) => {
			let busData = 	{
				id: "0",
				key: "a || 1 = 1; --hi",
				route: "1",
				progress: "0.0"
			}
			chai.request(server)
				.post('/busdata')
				.send(busData)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});
});

