const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const appConfig = require('../../config/app.config');
const test = require('../../util/test');
const User = require('../user/user.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Sessions', () => {

  describe('GET /sessions', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .get(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(405);
          expect(res.body.error.status).to.be.equal(405);
          expect(res.body.error.message).to.be.equal('method not allowed');
          done();
        });
    });

  });

  describe('POST /sessions', () => {

    it('should return 405, method not allowed', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(`${apiPath}/sessions`)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password })
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
            done();
          });
      });
    });

  });

  describe('PUT /sessions', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .put(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(405);
          expect(res.body.error.status).to.be.equal(405);
          expect(res.body.error.message).to.be.equal('method not allowed');
          done();
        });
    });

  });

  describe('PATCH /sessions', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .patch(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(405);
          expect(res.body.error.status).to.be.equal(405);
          expect(res.body.error.message).to.be.equal('method not allowed');
          done();
        });
    });

  });

  describe('DELETE /sessions', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .delete(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(405);
          expect(res.body.error.status).to.be.equal(405);
          expect(res.body.error.message).to.be.equal('method not allowed');
          done();
        });
    });

  });

});