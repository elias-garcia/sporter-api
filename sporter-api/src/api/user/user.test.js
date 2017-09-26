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

  beforeEach(async function () {
    await User.remove({});
  });

  describe('GET /users', function () {

    it('should return 501, not implemented', async function () {
      try {
        await chai.request(app)
          .get(userPath)
          .set('content-type', 'application/json')
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });

  });

  describe('POST /users', function () {

    it('should return 200, id and an auth token', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.data.session).to.have.all.keys(['_id', 'token']);
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should return 422 when the email is not a string', async function () {
      user = test.createUser('user@test.com');

      user.email = 10;

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user)
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the email is not valid', async function () {
      const user = test.createUser('user@test.com');

      user.email = 'email';

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when password is not sent', async function () {
      const user = test.createUser('user@test.com');

      delete user.password;

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the first name is not a string', async function () {
      const user = test.createUser('user@test.com');

      user.first_name = true;

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }

    });

    it('should return 422 when the last name is not a string', async function () {
      const user = test.createUser('user@test.com');

      user.last_name = 1;

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the age is not a number', async function () {
      const user = test.createUser('user@test.com');

      user.age = '19';

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the location is not a string', async function () {
      const user = test.createUser('user@test.com');

      user.location = 10;

      User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 409 when posting a user with an existing email', async function () {
      const user = test.createUser('user@test.com');

      await User.create();

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('user already exists');
      }
    });

  });

  describe('PUT /users', function () {

    it('should return 501, not implemented', async function () {
      try {
        await chai.request(app)
          .put(userPath)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });

  });

  describe('PATCH /users', function () {

    it('should return 501, not implemented', async function () {
      try {
        await chai.request(app)
          .patch(userPath)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });

  });

  describe('DELETE /users', function () {

    it('should return 501, not implemented', async function () {
      try {
        await chai.request(app)
          .get(userPath)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });

  });

  describe('GET /users/:userId', function () {

    it('should return 200 and a user when finding an existing user', async function () {
      let user = test.createUser('user@test.com');

      user = await User.create(user);

      try {
        const res = await chai.request(app)
          .get(`${userPath}/${user._id}`)
          .set('content-type', 'application/json');

        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.data.user.email).to.be.equal(user.email);
        expect(res.body.data.user.firstName).to.be.equal(user.firstName);
        expect(res.body.data.user.lastName).to.be.equal(user.lastName);
        expect(res.body.data.user.location).to.be.equal(user.location);
      } catch (e) {
        console.log(e.response);
        throw new Error(e);
      }
    });

    it('should return 422 if the userId is not a string', async function () {
      const user = test.createUser('user@test.com');
      const userId = 930;

      await User.create(user);

      try {
        await chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json');;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 if the userId is not a MongoId', async function () {
      const user = test.createUser('user@test.com');
      const userId = '930';

      await User.create(user);

      try {
        await chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 if the userId doesn\'t exist', async function () {
      try {
        await chai.request(app)
          .get(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

  });

  describe('POST /users/:userId', function () {

    it('should return 501, not implemented', async function () {
      try {
        await chai.request(app)
          .post(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });

  });

  describe('PUT /users/:userId', function () {

    it('should return 204 and update the user', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res1 = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res1.body.data.session._id;
        const token = res1.body.data.session.token;

        user.email = 'put@users.com';
        user.password = 'newPassword';
        user.first_name = 'newTestFirstName';
        user.last_name = 'newTestLastName';
        user.age = 20;
        user.location = 'A Coruña';

        const res2 = await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(res2).to.be.json;
        expect(res2).to.have.status(204);
        expect(res2.body).to.be.empty;
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should return 422, unprocessable entity if the userId is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res1 = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 10;
        const token = res1.body.data.session.token;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 'asd123a';
        const token = res.body.data.session.token;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the email is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.email = false;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the email is not a valid email', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.email = 'string';

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user)
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the first name is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.first_name = 20;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the last name is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.last_name = 021;

        chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user)
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the age is not a number', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.age = '22';

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the location is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        user.location = true;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 401 if the token is not supplied', async function () {
      const user = test.createUser('user@test.com');

      try {
        await chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
      }
    });

    it('should return 401 if the token is not valid', async function () {
      const user = test.createUser('user@test.com');

      try {
        await chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${notValidToken}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 403 if the user is not allowed', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404 if the userId does not exist', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        await User.remove({});

        chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

  });

  describe('PATCH /users/:userId', function () {

    it('should return 204 and change the user password', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res1 = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res1.body.data.session._id;
        const token = res1.body.data.session.token;

        const body = {
          'old_password': user.password,
          'new_password': 'new_password'
        };

        const res2 = await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(res2).to.be.json;
        expect(res2).to.have.status(204);
        expect(res2.body).to.be.empty;
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should return 422, unprocessable entity when the userId is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

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
          .send(body);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the userId is not a MongoId', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

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
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the old password is not sent', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

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
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the new password is not sent', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        const body = {
          'old_password': user.password
        };

        chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the old password sent is wrong', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

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
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 403, forbidden when the user is not allowed to change the password', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

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
          .send(body);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404, not found when the user to be updated does not exist', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        const body = {
          'old_password': user.password,
          'new_password': 'new_password'
        };

        await User.remove({});

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

  });

  describe('DELETE /users/:userId', function () {

    it('should return 204 and delete the existing user', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res1 = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res1.body.data.session._id;
        const token = res1.body.data.session.token;

        const res2 = await chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`);

        expect(res2).to.be.json;
        expect(res2).to.have.status(204);
        expect(res2.body).to.be.empty;
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should return 422, unprocessable entity if the userId is not a string', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 5;
        const token = res.body.data.session.token;

        chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 'string';
        const token = res.body.data.session.token;

        chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 401 if the token is not supplied', async function () {
      try {
        await chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
      }
    });

    it('should return 401 if the token is not valid', async function () {
      try {
        await chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', notValidToken)
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 403 if the token is valid but the user is not authorized', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404 if the userId does not exist', async function () {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session._id;
        const token = res.body.data.session.token;

        User.remove({});

        chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

  });

});
