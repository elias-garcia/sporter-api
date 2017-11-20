const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const scheduler = require('../../util/scheduler');
const User = require('../user/user.model');
const PasswordResetToken = require('./password-reset-token.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Password Reset Token', () => {
  const passwordResetTokenPath = `${apiPath}/password-reset-token`;
  const notValidEmail = 'notValidEmail';
  const nonExistingEmail = 'nonExistingEmail@nonExisting.com';

  let user;

  beforeEach(async () => {
    user = await User.create(test.createUser('test@test.com'));
  });

  afterEach(async () => {
    await PasswordResetToken.remove({});
    await User.remove({});
    scheduler.cancel({}, () => { });
  });

  describe('POST /password-reset-token', () => {
    it('should return 202 accepted', async () => {
      const res = await chai.request(app)
        .post(passwordResetTokenPath)
        .set('content-type', 'application/json')
        .send({ email: user.email });

      expect(res).to.be.json;
      expect(res).to.have.status(202);

      const tokens = await PasswordResetToken.find({ user: user.id });
      expect(tokens.length).to.be.equal(1);
      scheduler.jobs({ 'data.userId': user.id }, (err, jobs) => {
        expect(jobs.length).to.be.equal(1);
      });
    }).timeout(5000);

    it('should return 422 unprocessable entity when the email is not sent', async () => {
      try {
        await chai.request(app)
          .post(passwordResetTokenPath)
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

    it('should return 422 unprocessable entity when the email is not valid', async () => {
      try {
        await chai.request(app)
          .post(passwordResetTokenPath)
          .set('content-type', 'application/json')
          .send({ email: notValidEmail });

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });


    it('should return 404 user not found then the email does not exist', async () => {
      try {
        await chai.request(app)
          .post(passwordResetTokenPath)
          .set('content-type', 'application/json')
          .send({ email: nonExistingEmail });

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

  describe('GET /password-reset-token', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .get(passwordResetTokenPath)
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

  describe('PUT /password-reset-token', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(passwordResetTokenPath)
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

  describe('PATCH /password-reset-token', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(passwordResetTokenPath)
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

  describe('DELETE /password-reset-token', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(passwordResetTokenPath)
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

  describe('PUT /events', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(passwordResetTokenPath)
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
