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

let user;
let userId, token;
const nonExistingUserId = '58ffc747a0033611f1f783a7';
const notValidToken = 'Bearer I1NiIsI6Ie.yJhbGciOiJIUz.eyJzdWkpXVCJ9';

describe('Users', () => {

  beforeEach((done) => {
    user = test.createUser();

    user.email = 'auth@test.com';
    User.remove({ }, () => {
      chai.request(app)
        .post(`${apiPath}/users/`)
        .send(user)
        .end((err, res) => {
          userId = res.body.data.session._id;
          token = res.body.data.session.token;
          done();
        });
    });
  });

  describe('GET /users', () => {

    it('should return 501, not implemented', (done) => {
      chai.request(app)
        .get(`${apiPath}/users`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('POST /users', () => {

    it('should return 200, id and an auth token', (done) => {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${apiPath}/users`)
        .send(localUser)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
          done();
        });
    });

    it('should return 409 when posting a user with an existing email', (done) => {
      const localUser = test.createUser();

      User.create(localUser, (err, doc) => {
        User.create(localUser, (err, doc) => {
          chai.request(app)
            .post(`${apiPath}/users`)
            .send(localUser)
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

    it('should return 501, not implemented', (done) => {
      chai.request(app)
        .put(`${apiPath}/users`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('PATCH /users', () => {

    it('should return 501, not implemented', (done) => {
      chai.request(app)
        .patch(`${apiPath}/users`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('DELETE /users', () => {

    it('should return 501, not implemented', (done) => {
      chai.request(app)
        .get(`${apiPath}/users`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('GET /users/:userId', () => {

    it('should return 200 and a user when finding an existing user', (done) => {
      const localUser = test.createUser();

      User.create(localUser, (err, doc) => {
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
      user.email = 'put@users.com';
      user.first_name = 'newTestFirstName';
      user.last_name = 'newTestLastName';
      user.age = 20;
      user.location = 'A Coruña';
      chai.request(app)
        .put(`${apiPath}/users/${userId}`)
        .set('authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it('should return 401 if the token is not supplied', (done) => {
      chai.request(app)
        .put(`${apiPath}/users/${userId}`)
        .send(user)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
          done();
        });
    });

    it('should return 401 if the token is not valid', (done) => {
      user.email = 'put@users.com';
      user.first_name = 'newTestFirstName';
      user.last_name = 'newTestLastName';
      user.age = 20;
      user.location = 'A Coruña';
      chai.request(app)
        .put(`${apiPath}/users/${userId}`)
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

    it('should return 4043 if the token is valid but the user is not authorized', (done) => {
      chai.request(app)
        .put(`${apiPath}/users/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(403);
          expect(res.body.error.status).to.be.equal(403);
          expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
          done();
        });
    });
  });

  describe('PATCH /users/:userId', () => {

    it('should return 501, not implemented', (done) => {
      chai.request(app)
        .patch(`${apiPath}/users`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(501);
          expect(res.body.error.status).to.be.equal(501);
          expect(res.body.error.message).to.be.equal('not implemented');
          done();
        });
    });

  });

  describe('DELETE /users/:userId', () => {
    
    it('should return 204 and delete the existing user', (done) => {
      chai.request(app)
        .delete(`${apiPath}/users/${userId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          done();
        });
    });

    it('should return 401 if the token is not supplied', (done) => {
      chai.request(app)
        .delete(`${apiPath}/users/${userId}`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
          done();
        });
    });

    it('should return 401 if the token is not valid', (done) => {
      chai.request(app)
        .delete(`${apiPath}/users/${userId}`)
        .set('content-type', 'application/json')
        .set('authorization', notValidToken)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('authorization token not valid');
          done();
        });
    });
    
    it('should return 403 if the token is valid but the user is not authorized', () => {
      chai.request(app)
        .delete(`${apiPath}/users/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(403);
          expect(res.body.error.status).to.be.equal(403);
          expect(res.body.error.message).to.be.equal('you are not allowed to accesss this resource');
          done();
        });
    });

  });

});
