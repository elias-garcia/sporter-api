const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const appConfig = require('../../config/app.config');
const test = require('../../util/test');
const User = require('../user/user.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Session', () => {
  const sessionPath = `${apiPath}/sessions`;

  afterEach(async () => {
    await User.remove({});
  });

  describe('GET /sessions', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .get(sessionPath)
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

  describe('POST /sessions', () => {
    it('should return 200, the userId and a token', async () => {
      let user = test.createUser('user@test.com');
      const plainPassword = user.password;

      user = await User.create(user);

      const res = await chai.request(app)
        .post(sessionPath)
        .set('content-type', 'application/json')
        .send({ email: user.email, password: plainPassword });

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.session).to.have.all.keys(['id', 'token']);
    });

    it('should return 422, unprocessable entity when email is not a string', async () => {
      let user = test.createUser('user@test.com');

      user.email = 9;

      user = await User.create(user);

      try {
        await chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });
        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422, unprocessable entity when email is not a valid email', async () => {
      let user = test.createUser('user@test.com');

      user.email = 'email';

      user = await User.create(user);

      try {
        await chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });
        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 401, unauthorized when the email does not match', async () => {
      let user = test.createUser('user@test.com');

      user = await User.create(user);

      user.email = 'new@email.com';

      try {
        await chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });
        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('email not found');
      }
    });

    it('should return 401, unauthorized when the password does not match', async () => {
      let user = test.createUser('user@test.com');

      user = await User.create(user);

      user.password = 'newpass';

      try {
        await chai.request(app)
          .post(sessionPath)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });
        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('password does not match');
      }
    });
  });

  describe('PUT /sessions', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(sessionPath)
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

  describe('PATCH /sessions', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(sessionPath)
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

  describe('DELETE /sessions', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(sessionPath)
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
});
