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

describe('User', function () {

  const userPath = `${apiPath}/users`;
  const nonExistingUserId = '59afcfa6f8e7020004e5765d';
  const notValidToken = 'Bearer I1NiIsI6Ie.yJhbGciOiJIUz.eyJzdWkpXVCJ9';

  beforeEach(function (done) {
    User.remove({}, () => {
      done();
    });
  });

  describe('GET /users', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .get(userPath)
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

  describe('POST /users', function () {

    it('should return 200, id and an auth token', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(localUser)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
          done();
        });
    });

    it('should return 409 when posting a user with an existing email', function (done) {
      const localUser = test.createUser();

      User.create(localUser, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .send(localUser)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(409);
            expect(res.body.error.status).to.be.equal(409);
            expect(res.body.error.message).to.be.equal('user already exists');
            done();
          });
      });
    });

  });

  describe('PUT /users', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .put(userPath)
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

  describe('PATCH /users', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .patch(userPath)
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

  describe('DELETE /users', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .get(userPath)
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

  describe('GET /users/:userId', function () {

    it('should return 200 and a user when finding an existing user', function (done) {
      const localUser = test.createUser();

      User.create(localUser, (err, doc) => {
        chai.request(app)
          .get(`${userPath}/${doc._id}`)
          .set('content-type', 'application/json')
          .end(function (err, res) {
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

    it('should return 400 if the userId is not a string', function (done) {
      const localUser = test.createUser();
      const userId = 930;

      User.create(localUser, (err, doc) => {
        chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(400);
            expect(res.body.error.status).to.be.equal(400);
            expect(res.body.error.message).to.be.equal('bad request');
            done();
          });
      });
    });

    it('should return 400 if the userId is not a MongoId', function (done) {
      const localUser = test.createUser();
      const userId = '930';

      User.create(localUser, (err, doc) => {
        chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(400);
            expect(res.body.error.status).to.be.equal(400);
            expect(res.body.error.message).to.be.equal('bad request');
            done();
          });
      });
    });

    it('should return 404 if the userId doesn\'t exist', function (done) {
      chai.request(app)
        .get(`${userPath}/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(404);
          expect(res.body.error.status).to.be.equal(404);
          expect(res.body.error.message).to.be.equal('user not found');
          done();
        });
    });

  });

  describe('POST /users/:userId', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .post(`${userPath}/${nonExistingUserId}`)
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

  describe('PUT /users/:userId', function () {

    it('should return 204 and update the user', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.email = 'put@users.com';
          localUser.password = 'newPassword';
          localUser.first_name = 'newTestFirstName';
          localUser.last_name = 'newTestLastName';
          localUser.age = 20;
          localUser.location = 'A Coruña';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });

    it('should return 400, bad request if the userId is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = 10;
          const token = res.body.data.session.token;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the userId is not a MongoId', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = 'asd123a';
          const token = res.body.data.session.token;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the email is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.email = false;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the email is not a valid email', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.email = 'string';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the first name is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.first_name = 20;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the last name is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.last_name = 021;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the age is not a number', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.age = '22';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the location is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          localUser.location = true;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 401 if the token is not supplied', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .put(`${apiPath}/users/${nonExistingUserId}`)
        .send(localUser)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
          done();
        });
    });

    it('should return 401 if the token is not valid', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .put(`${apiPath}/users/${nonExistingUserId}`)
        .set('authorization', notValidToken)
        .send(localUser)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('authorization token not valid');
          done();
        });
    });

    it('should return 404 if the userId does not exist', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          User.remove({}, function () {
            chai.request(app)
              .put(`${apiPath}/users/${userId}`)
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(localUser)
              .end(function (err, res) {
                console.log(res.body);
                expect(res).to.be.json;
                expect(res).to.have.status(404);
                expect(res.body.error.status).to.be.equal(404);
                expect(res.body.error.message).to.be.equal('user not found');
                done();
              });
          });
        });
    });

  });

  describe('PATCH /users/:userId', function () {

    it('should return 501, not implemented', function (done) {
      chai.request(app)
        .patch(userPath)
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

  describe('DELETE /users/:userId', function () {

    it('should return 204 and delete the existing user', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${apiPath}/users/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });

    it('should return 400, bad request if the userId is not a string', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = 5;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 400, bad request if the userId is not a MongoId', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .send(localUser)
        .end(function (err, res) {
          const userId = 'string';
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(localUser)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(400);
              expect(res.body.error.status).to.be.equal(400);
              expect(res.body.error.message).to.be.equal('bad request');
              done();
            });
        });
    });

    it('should return 401 if the token is not supplied', function (done) {
      chai.request(app)
        .delete(`${apiPath}/users/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
          done();
        });
    });

    it('should return 401 if the token is not valid', function (done) {
      chai.request(app)
        .delete(`${userPath}/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .set('authorization', notValidToken)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('authorization token not valid');
          done();
        });
    });

    it('should return 403 if the token is valid but the user is not authorized', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${apiPath}/users/${nonExistingUserId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(403);
              expect(res.body.error.status).to.be.equal(403);
              expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
              done();
            });
        });
    });

    it('should return 404 if the userId does not exist', function (done) {
      const localUser = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(localUser)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          User.remove({}, function () {
            chai.request(app)
              .delete(`${apiPath}/users/${userId}`)
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .end(function (err, res) {
                expect(res).to.be.json;
                expect(res).to.have.status(404);
                expect(res.body.error.status).to.be.equal(404);
                expect(res.body.error.message).to.be.equal('user not found');
                done();
              });
          });
        });
    });

  });

});
