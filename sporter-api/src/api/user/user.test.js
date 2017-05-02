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

  afterEach((done) => {
    User.remove({ }, () => {
      done();
    });
  });

  describe('POST /users', () => {

    it('should return 200, id and an auth token', (done) => {
      const user = test.createUser();

      chai.request(app)
        .post(`${apiPath}/users`)
        .send(user)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
          done();
        });
    });

    it('should return 409 when posting a user with an existing email', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        User.create(user, (err, doc) => {
          chai.request(app)
            .post(`${apiPath}/users`)
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
    });

  });

  describe('GET /users', () => {

    it('should return 200 and a user when finding an existing user', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        chai.request(app)
            .get(`${apiPath}/users/${doc._id}`)
            .set('content-type', 'application/json')
            .end((err, res) => {
              expect(res).to.be.json;
              expect(res).to.have.status(200);
              done();
            });
      });
    });

    it('should return 404 if the userId doesn\'t exists', (done) => {
      const nonExistingUserId = '58ffc747a0033611f1f783a7';

      chai.request(app)
          .get(`${apiPath}/users/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(404);
            expect(res.body.error.status).to.be.equal(404);
            expect(res.body.error.message).to.be.equal('user not found');
            done();
          });
    });

  });

});
