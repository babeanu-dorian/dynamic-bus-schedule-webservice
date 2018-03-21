process.env.NODE_ENV = 'test';

var chai = require('chai');
var chatHttp = require('chai-http');

var index = require('../dynamicBusNodeServer/routes/index');
var server = require('../dynamicBusNodeServer/app');
var should = chai.should();

chai.use(chatHttp);

describe('GET index', () => {
	it('it should GET the index', (done) => {
		chai.request('localhost:3000')
			.get('/')
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});

describe('GET index', () => {
	it('it should GET the index', (done) => {
		chai.request('localhost:3000')
			.get('/?route=1')
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});
