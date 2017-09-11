const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const appConfig = require('../../config/app.config');
const test = require('../../util/test');
const User = require('../user/user.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Sessions', function () {

  describe('GET /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .get(`${apiPath}/sessions`)
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

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(`${apiPath}/sessions`)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
            done();
          });
      });
    });

    it('should return 400, bad request', function (done) {
      let user = test.createUser();
      user.email = 9;
      user.password = 9;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(`${apiPath}/sessions`)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(400);
            expect(res.body.error.status).to.be.equal(400);
            expect(res.body.error.message).to.be.equal('bad request');
            done();
          });
      });
    });

  });

  describe('PUT /sessions', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .put(`${apiPath}/sessions`)
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
        .patch(`${apiPath}/sessions`)
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
        .delete(`${apiPath}/sessions`)
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