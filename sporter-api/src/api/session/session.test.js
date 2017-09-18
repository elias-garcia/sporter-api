const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const appConfig = require('../../config/app.config');
const test = require('../../util/test');
const User = require('../user/user.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Session', function () {

  const sessionPath = `${apiPath}/sessions`;

  beforeEach(function (done) {
    User.remove({}, () => {
      done();
    });
  });

  describe('GET /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .get(sessionPath)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('POST /sessions', function () {

    it('should return 200, the userId and a token', function (done) {
      const user = test.createUser();
      const plainPassword = user.password;

      user.password = bcrypt.hashSync(user.password, 10)

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: plainPassword })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
            done();
          });
      });
    });

    it('should return 422, unprocessable entity when email is not a string', function (done) {
      let user = test.createUser();
      user.email = 9;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422, unprocessable entity when email is not a valid email', function (done) {
      let user = test.createUser();
      user.email = 'email';

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 401, unauthorized when the email does not match', function (done) {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        user.email = 'new@email.com';
        chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(401);
            expect(res.body.error.status).to.be.equal(401);
            expect(res.body.error.message).to.be.equal('email does not exist');
            done();
          });
      });
    });

    it('should return 401, unauthorized when the password does not match', function (done) {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        user.password = 'newpass';
        chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(401);
            expect(res.body.error.status).to.be.equal(401);
            expect(res.body.error.message).to.be.equal('password does not match');
            done();
          });
      });
    });

  });

  describe('PUT /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .put(sessionPath)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('PATCH /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .patch(sessionPath)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('DELETE /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .delete(sessionPath)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

});