const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const User = require('./user.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('User', () => {
  const userPath = `${apiPath}/users`;
  const passwordResetTokenPath = `${apiPath}/password-reset-token`;
  const nonExistingUserId = '59afcfa6f8e7020004e5765d';
  const notValidToken = 'Bearer I1NiIsI6Ie.yJhbGciOiJIUz.eyJzdWkpXVCJ9';

  afterEach(async () => {
    await User.remove({});
  });

  describe('GET /users', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .get(userPath)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });
  });

  describe('POST /users', () => {
    it('should return 201, id and an auth token', async () => {
      const user = test.createUser('user@test.com');

      const res = await chai.request(app)
        .post(userPath)
        .set('content-type', 'application/json')
        .send(user);

      expect(res).to.be.json;
      expect(res).to.have.status(201);
      expect(res.body.data.session).to.have.all.keys(['id', 'token']);
    });

    it('should return 422 when the email is not a string', async () => {
      const user = test.createUser('user@test.com');

      user.email = 10;

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the email is not valid', async () => {
      const user = test.createUser('user@test.com');

      user.email = 'email';

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when password is not sent', async () => {
      const user = test.createUser('user@test.com');

      delete user.password;

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the first name is not a string', async () => {
      const user = test.createUser('user@test.com');

      user.firstName = true;

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the last name is not a string', async () => {
      const user = test.createUser('user@test.com');

      user.lastName = 1;

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the age is not a number', async () => {
      const user = test.createUser('user@test.com');

      user.age = '19';

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 when the location is not a string', async () => {
      const user = test.createUser('user@test.com');

      user.location = 10;

      User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 409 when posting a user with an existing email', async () => {
      const user = test.createUser('user@test.com');

      await User.create(user);

      try {
        await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('user already exists');
      }
    });
  });

  describe('PUT /users', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(userPath)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });
  });

  describe('PATCH /users', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(userPath)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });
  });

  describe('DELETE /users', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .get(userPath)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });
  });

  describe('GET /users/:userId', () => {
    it('should return 200 and a user when finding an existing user', async () => {
      let user = test.createUser('user@test.com');

      user = await User.create(user);

      const res = await chai.request(app)
        .get(`${userPath}/${user.id}`)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.user).to.have.all.keys(['id', 'email', 'firstName',
        'lastName', 'age', 'location', 'updatedAt', 'createdAt']);
      expect(res.body.data.user.email).to.be.equal(user.email);
      expect(res.body.data.user.firstName).to.be.equal(user.firstName);
      expect(res.body.data.user.lastName).to.be.equal(user.lastName);
      expect(res.body.data.user.location).to.be.equal(user.location);
    });

    it('should return 422 if the userId is not a string', async () => {
      const user = test.createUser('user@test.com');
      const userId = 930;

      await User.create(user);

      try {
        await chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 if the userId is not a MongoId', async () => {
      const user = test.createUser('user@test.com');
      const userId = '930';

      await User.create(user);

      try {
        await chai.request(app)
          .get(`${userPath}/${userId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 if the userId doesn\'t exist', async () => {
      try {
        await chai.request(app)
          .get(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });
  });

  describe('POST /users/:userId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .post(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(501);
        expect(res.body.error.status).to.be.equal(501);
        expect(res.body.error.message).to.be.equal('not implemented');
      }
    });
  });

  describe('PUT /users/:userId', () => {
    it('should return 200 and update the user', async () => {
      const user = test.createUser('user@test.com');

      const res1 = await chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user);

      const userId = res1.body.data.session.id;
      const { token } = res1.body.data.session;

      user.email = 'put@users.com';
      user.password = 'newPassword';
      user.firstName = 'newTestFirstName';
      user.lastName = 'newTestLastName';
      user.age = 20;
      user.location = 'A Coruña';

      const res2 = await chai.request(app)
        .put(`${userPath}/${userId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .send(user);

      expect(res2).to.be.json;
      expect(res2).to.have.status(200);
      expect(res2.body.data.user).to.have.all.keys(['id', 'email', 'firstName',
        'lastName', 'age', 'location', 'updatedAt', 'createdAt']);
    });

    it('should return 422, unprocessable entity if the userId is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res1 = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 10;
        const { token } = res1.body.data.session;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 'asd123a';
        const { token } = res.body.data.session;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the email is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.email = false;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the email is not a valid email', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.email = 'string';

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the first name is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.firstName = 20;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the last name is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.lastName = 231;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the age is not a number', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.age = '22';

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the location is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        user.location = true;

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 401 if the token is not supplied', async () => {
      const user = test.createUser('user@test.com');

      try {
        await chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
      }
    });

    it('should return 401 if the token is not valid', async () => {
      const user = test.createUser('user@test.com');

      try {
        await chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${notValidToken}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 403 if the user is not allowed', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .send(user);

        const { token } = res.body.data.session;

        await chai.request(app)
          .put(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404 if the userId not found', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        await User.remove({});

        await chai.request(app)
          .put(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });
  });

  describe('PATCH /users/:userId', () => {
    it('should return 204 and change the user password when the token is not send', async () => {
      const user = test.createUser('user@test.com');

      const res1 = await chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user);

      const userId = res1.body.data.session.id;
      const { token } = res1.body.data.session;

      const body = {
        old_password: user.password,
        new_password: 'new_password',
        new_password_repeat: 'new_password',
      };

      const res2 = await chai.request(app)
        .patch(`${userPath}/${userId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .send(body);

      expect(res2).to.be.json;
      expect(res2).to.have.status(204);
      expect(res2.body).to.be.empty;
    });

    it('should return 422, unprocessable entity when the userId is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 20;
        const { token } = res.body.data.session;

        const body = {
          old_password: user.password,
          new_password: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the userId is not a MongoId', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 'userId';
        const { token } = res.body.data.session;

        const body = {
          old_password: user.password,
          new_password: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the old password is not sent', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          new_password: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the new password is not sent', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          old_password: user.password,
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the new password repeat is not sent', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          old_password: 'old_password',
          new_password: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the new passwords does not match', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          old_password: 'old_password',
          new_password: 'new_password',
          new_password_repeat: 'another_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when the old password sent is wrong', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          old_password: 'old_password',
          new_password: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 403, forbidden when the user is not allowed to change the password', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const { token } = res.body.data.session;

        const body = {
          old_password: user.password,
          new_password: 'new_password',
          new_password_repeat: 'new_password',
        };

        await chai.request(app)
          .patch(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404, not found when the user to be updated not found', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        const body = {
          old_password: user.password,
          new_password: 'new_password',
          new_password_repeat: 'new_password',
        };

        await User.remove({});

        await chai.request(app)
          .patch(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(body);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });
  });

  describe('DELETE /users/:userId', () => {
    it('should return 204 and delete the existing user', async () => {
      const user = test.createUser('user@test.com');

      const res1 = await chai.request(app)
        .post(`${userPath}`)
        .set('content-type', 'application/json')
        .send(user);

      const userId = res1.body.data.session.id;
      const { token } = res1.body.data.session;

      const res2 = await chai.request(app)
        .delete(`${userPath}/${userId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${token}`);

      expect(res2).to.be.json;
      expect(res2).to.have.status(204);
      expect(res2.body).to.be.empty;
    });

    it('should return 422, unprocessable entity if the userId is not a string', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 5;
        const { token } = res.body.data.session;

        await chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity if the userId is not a MongoId', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(`${userPath}`)
          .set('content-type', 'application/json')
          .send(user);

        const userId = 'string';
        const { token } = res.body.data.session;

        await chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send(user);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 401 if the token is not supplied', async () => {
      try {
        await chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('you need to provide an authentication token');
      }
    });

    it('should return 401 if the token is not valid', async () => {
      try {
        await chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', notValidToken);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 403 if the token is valid but the user is not authorized', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        const { token } = res.body.data.session;

        await chai.request(app)
          .delete(`${userPath}/${nonExistingUserId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404 if the userId not found', async () => {
      const user = test.createUser('user@test.com');

      try {
        const res = await chai.request(app)
          .post(userPath)
          .set('content-type', 'application/json')
          .send(user);

        const userId = res.body.data.session.id;
        const { token } = res.body.data.session;

        await User.remove({});

        await chai.request(app)
          .delete(`${userPath}/${userId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${token}`);

        expect(true).to.be.false;
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
