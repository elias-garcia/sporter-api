/* jshint expr: true */
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const User = require('./user.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

const nonExistingUserId = '58ffc747a0033611f1f783a7';
const notValidToken = 'Bearer I1NiIsI6Ie.yJhbGciOiJIUz.eyJzdWkpXVCJ9';

describe('Users', () => {

  afterEach((done) => {
    User.remove({ }, () => {
      done();
    });
  });

  describe('GET /users', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .get(`${apiPath}/users`)
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

  describe('PUT /users', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .put(`${apiPath}/users`)
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

  describe('PATCH /users', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .patch(`${apiPath}/users`)
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

  describe('DELETE /users', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .get(`${apiPath}/users`)
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

  describe('GET /users/:userId', () => {

    it('should return 200 and a user when finding an existing user', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        chai.request(app)
          .get(`${apiPath}/users/${doc._id}`)
          .set('content-type', 'application/json')
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.data.user.email).to.be.equal(doc.email);
            expect(res.body.data.user.firstName).to.be.equal(doc.firstName);
            expect(res.body.data.user.lastName).to.be.equal(doc.lastName);
            expect(res.body.data.user.location).to.be.equal(doc.location);
            done();
          });
      });
    });

    it('should return 404 if the userId doesn\'t exist', (done) => {
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

  describe('PUT /users/:userId', () => {

    it('should return 204 and update the user', (done) => {
      const user = test.createUser();

      chai.request(app)
        .post(`${apiPath}/users/`)
        .send(user)
        .end((err, res) => {
          user.email = 'put@users.com';
          user.first_name = 'newTestFirstName';
          user.last_name = 'newTestLastName';
          user.age = 20;
          user.location = 'A Coruña';
          chai.request(app)
            .put(`${apiPath}/users/${res.body.data.session._id}`)
            .set('authorization', `Bearer ${res.body.data.session.token}`)
            .send(user)
            .end((err, res) => {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });

    it('should return 401 if the token is not supplied', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        user.email = 'put@users.com';
        user.first_name = 'newTestFirstName';
        user.last_name = 'newTestLastName';
        user.age = 20;
        user.location = 'A Coruña';
        chai.request(app)
          .put(`${apiPath}/users/${doc._id}`)
          .send(user)
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(401);
            expect(res.body.error.status).to.be.equal(401);
            expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
            done();
          });
      });
    });

    it('should return 401 if the token is not valid', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        user.email = 'put@users.com';
        user.first_name = 'newTestFirstName';
        user.last_name = 'newTestLastName';
        user.age = 20;
        user.location = 'A Coruña';
        chai.request(app)
          .put(`${apiPath}/users/${doc._id}`)
          .set('authorization', notValidToken)
          .send(user)
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(401);
            expect(res.body.error.status).to.be.equal(401);
            expect(res.body.error.message).to.be.equal('authorization token not valid');
            done();
          });
      });
    });

    it('should return 404 when user doesn\'t exist', (done) => {
      chai.request(app)
        .delete(`${apiPath}/users/${nonExistingUserId}`)
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

  describe('PATCH /users/:userId', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .patch(`${apiPath}/users`)
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

  describe('DELETE /users/:userId', () => {
    
    it('should return 204 and delete the existing user', (done) => {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        chai.request(app)
            .delete(`${apiPath}/users/${doc._id}`)
            .set('content-type', 'application/json')
            .end((err, res) => {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
      });
    });

    it('should return 404 when user doesn\'t exist', (done) => {
      chai.request(app)
        .delete(`${apiPath}/users/${nonExistingUserId}`)
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
