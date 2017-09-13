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
      const user = test.createUser();

      chai.request(app)
        .post(userPath)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
          done();
        });
    });

    it('should return 422 when the email is not a string', function (done) {
      const user = test.createUser();

      user.email = 10;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when the email is not valid', function (done) {
      const user = test.createUser();

      user.email = 'email';

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when password is not sent', function (done) {
      const user = test.createUser();

      delete user.password;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when the first name is not a string', function (done) {
      const user = test.createUser();

      user.first_name = true;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when the last name is not a string', function (done) {
      const user = test.createUser();

      user.last_name = 1;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when the age is not a number', function (done) {
      const user = test.createUser();

      user.age = '19';

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 when the location is not a string', function (done) {
      const user = test.createUser();

      user.location = 10;

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 409 when posting a user with an existing email', function (done) {
      const user = test.createUser();

      User.create(user, (err, doc) => {
        chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
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
      const user = test.createUser();

      User.create(user, (err, doc) => {
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

    it('should return 422 if the userId is not a string', function (done) {
      const user = test.createUser();
      const userId = 930;

      User.create(user, (err, doc) => {
        chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
            done();
          });
      });
    });

    it('should return 422 if the userId is not a MongoId', function (done) {
      const user = test.createUser();
      const userId = '930';

      User.create(user, (err, doc) => {
        chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .end(function (err, res) {
            expect(res).to.be.json;
            expect(res).to.have.status(422);
            expect(res.body.error.status).to.be.equal(422);
            expect(res.body.error.message).to.be.equal('unprocessable entity');
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
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.email = 'put@users.com';
          user.password = 'newPassword';
          user.first_name = 'newTestFirstName';
          user.last_name = 'newTestLastName';
          user.age = 20;
          user.location = 'A Coruña';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the userId is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 10;
          const token = res.body.data.session.token;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 'asd123a';
          const token = res.body.data.session.token;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the email is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.email = false;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the email is not a valid email', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.email = 'string';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the first name is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.first_name = 20;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the last name is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.last_name = 021;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the age is not a number', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.age = '22';

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the location is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          user.location = true;

          chai.request(app)
            .put(`${userPath}/${userId}`)
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 401 if the token is not supplied', function (done) {
      const user = test.createUser();

      chai.request(app)
        .put(`${userPath}/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
          done();
        });
    });

    it('should return 401 if the token is not valid', function (done) {
      const user = test.createUser();

      chai.request(app)
        .put(`${userPath}/${nonExistingUserId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${notValidToken}`)
        .send(user)
        .end(function (err, res) {
          expect(res).to.be.json;
          expect(res).to.have.status(401);
          expect(res.body.error.status).to.be.equal(401);
          expect(res.body.error.message).to.be.equal('authorization token not valid');
          done();
        });
    });

    it('should return 403 if the user is not allowed', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          chai.request(app)
            .put(`${userPath}/${nonExistingUserId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(user)
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
      const user = test.createUser();

      chai.request(app)
        .post(userPath)
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          User.remove({}, function () {
            chai.request(app)
              .put(`${userPath}/${userId}`)
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(user)
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

  describe('PATCH /users/:userId', function () {

    it('should return 204 and change the user password', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password,
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(204);
              expect(res.body).to.be.empty;
              done();
            });
        });
    });

    it('should return 422, unprocessable entity when the userId is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 20;
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password,
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity when the userId is not a MongoId', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 'userId';
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password,
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity when the old password is not sent', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity when the new password is not sent', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity when the old password sent is wrong', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'old_password': 'old_password',
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 403, forbidden when the user is not allowed to change the password', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password,
            'new_password': 'new_password'
          };

          chai.request(app)
            .patch(`${userPath}/${nonExistingUserId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(body)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(403);
              expect(res.body.error.status).to.be.equal(403);
              expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
              done();
            });
        });
    });

    it('should return 404, not found when the user to be updated does not exist', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          const body = {
            'old_password': user.password,
            'new_password': 'new_password'
          };

          User.remove({}, function () {
            chai.request(app)
              .patch(`${userPath}/${userId}`)
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(body)
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

  describe('DELETE /users/:userId', function () {

    it('should return 204 and delete the existing user', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${userId}`)
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

    it('should return 422, unprocessable entity if the userId is not a string', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 5;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', function (done) {
      const user = test.createUser();

      chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = 'string';
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${userId}`)
            .set('content-type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(user)
            .end(function (err, res) {
              expect(res).to.be.json;
              expect(res).to.have.status(422);
              expect(res.body.error.status).to.be.equal(422);
              expect(res.body.error.message).to.be.equal('unprocessable entity');
              done();
            });
        });
    });

    it('should return 401 if the token is not supplied', function (done) {
      chai.request(app)
        .delete(`${userPath}/${nonExistingUserId}`)
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
      const user = test.createUser();

      chai.request(app)
        .post(userPath)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          chai.request(app)
            .delete(`${userPath}/${nonExistingUserId}`)
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
      const user = test.createUser();

      chai.request(app)
        .post(userPath)
        .set('content-type', 'application/json')
        .send(user)
        .end(function (err, res) {
          const userId = res.body.data.session._id;
          const token = res.body.data.session.token;

          User.remove({}, function () {
            chai.request(app)
              .delete(`${userPath}/${userId}`)
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
