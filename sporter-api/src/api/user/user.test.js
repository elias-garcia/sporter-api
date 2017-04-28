const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const User = require('./user.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Users', () => {

  beforeEach(() => {
    User.remove({ });
  });

});

describe('POST /users', () => {

  it('should return an id and an auth token', (done) => {
    const user = test.createUser();

    chai.request(app)
      .post(apiPath + '/users')
      .set('Content-Type', 'application/json')
      .send(user)
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
        done();
    });
  });

  it('should return 409 when posting a user with existing email', (done) => {
    const user = test.createUser();

    chai.request(app)
      .post(apiPath + '/users')
      .set('Content-Type', 'application/json')
      .send(user)
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('user already exists');
        done();
    });
  });

});
