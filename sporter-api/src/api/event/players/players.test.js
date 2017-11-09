const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const test = require('../../../util/test');
const appConfig = require('../../../config/app.config');
const Sport = require('../../sport/sport.model');
const User = require('../../user/user.model');
const Event = require('../event.model');
const eventStatus = require('../event-status.enum');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Event Players', () => {
  const eventPath = `${apiPath}/events`;
  const nonExistingId = '59f1b902020ca91a82c1eca3';
  const notValidMongoId = 'asdf1234';
  const notValidToken = 'Bearer I1NiIsI6Ie.yJhbGciOiJIUz.eyJzdWkpXVCJ9';

  let sport;
  let user;
  let event;
  let userToken;

  beforeEach(async () => {
    const preUser = test.createUser('user@test.com');

    sport = await Sport.create(test.createSport('Tenis'));
    user = await User.create(preUser);
    event = await Event.create(test.createEventDb(user.id, sport.id, 1));

    const res = await chai.request(app)
      .post(`${apiPath}/sessions`)
      .set('content-type', 'application/json')
      .send({ email: preUser.email, password: preUser.password });

    userToken = res.body.data.session.token;
  });

  afterEach(async () => {
    await Event.remove({});
    await User.remove({});
    await Sport.remove({});
  });

  describe('POST /events/:eventId/players', () => {
    it('should return 200, the player added to the event and set the event status to full', async () => {
      const preUser = test.createUser('user2@test.com');
      const user2 = await User.create(preUser);
      const res = await chai.request(app)
        .post(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .send({ email: preUser.email, password: preUser.password });
      const user2Token = res.body.data.session.token;

      const res2 = await chai.request(app)
        .post(`${eventPath}/${event.id}/players`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user2Token}`);

      expect(res2).to.be.json;
      expect(res2).to.have.status(201);
      expect(res2.body.data.player).to.have.all.keys(['id', 'email', 'firstName',
        'lastName', 'age', 'location', 'updatedAt', 'createdAt']);
      expect(res2.body.data.player.id).to.be.equal(user2.id);
      expect(res2.body.data.player.email).to.be.equal(user2.email);
      expect(res2.body.data.player.firstName).to.be.equal(user2.firstName);
      expect(res2.body.data.player.lastName).to.be.equal(user2.lastName);
      expect(res2.body.data.player.age).to.be.equal(user2.age);
      expect(res2.body.data.player.location).to.be.equal(user2.location);

      const dbEvent = await Event.findById(event.id);

      expect(dbEvent.status).to.be.equal(eventStatus.FULL);
    });

    it('should return 401 unauthorized if the user is not authenticated', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${event.id}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${notValidToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 404 not found when the user does not exist', async () => {
      try {
        await User.remove({});

        await chai.request(app)
          .post(`${eventPath}/${event.id}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

    it('should return 404 not found when the event does not exist', async () => {
      try {
        await event.remove();

        await chai.request(app)
          .post(`${eventPath}/${event.id}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('event not found');
      }
    });

    it('should return 409 conflict when the event status is not WAITING', async () => {
      const preUser = test.createUser('user2@test.com');

      await User.create(preUser);

      const res = await chai.request(app)
        .post(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .send({ email: preUser.email, password: preUser.password });
      const user2Token = res.body.data.session.token;

      event.status = eventStatus.FINISHED;
      await event.save();

      try {
        await chai.request(app)
          .post(`${eventPath}/${event.id}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user2Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res2 = e.response;

        expect(res2).to.be.json;
        expect(res2).to.have.status(409);
        expect(res2.body.error.status).to.be.equal(409);
        expect(res2.body.error.message).to.be.equal('event does not accept new players');
      }
    });

    it('should return 409 coflict when the user have already joined the event', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${event.id}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('you\'ve already joined the event');
      }
    });

    it('should return 422 unprocessable entity when the eventId is not a valid mongoId', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${notValidMongoId}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });
  });

  describe('GET /events/:eventId/players', () => {
    it('should return 200 and all the players in the event', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}/${event.id}/players`)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.players.length).to.be.equal(1);
      expect(res.body.data.players[0]).to.have.all.keys(['id', 'email', 'firstName',
        'lastName', 'age', 'location', 'updatedAt', 'createdAt']);
    });

    it('should return 404 not found when the event does not exist', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${nonExistingId}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('event not found');
      }
    });

    it('should return 422 unprocessable entity when the eventId is not a valid mongoId', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${notValidMongoId}/players`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });
  });

  describe('PUT /events/:eventId/players', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(`${eventPath}/${event.id}/players`)
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

  describe('PATCH /events/:eventId/players', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(`${eventPath}/${event.id}/players`)
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

  describe('DELETE /events/:eventId/players', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players`)
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

  describe('POST /events/:eventId/players/:playerId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${event.id}/players/${nonExistingId}`)
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

  describe('GET /events/:eventId/players/:playerId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .get(`${eventPath}/${event.id}/players/${nonExistingId}`)
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

  describe('PUT /events/:eventId/players/:playerId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(`${eventPath}/${event.id}/players/${nonExistingId}`)
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

  describe('PATCH /events/:eventId/players/:playerId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(`${eventPath}/${event.id}/players/${nonExistingId}`)
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

  describe('DELETE /events/:eventId/players/:playerId', () => {
    it('should return 204 if the player can leave the event and change the event status to WAITING', async () => {
      const preUser = test.createUser('user2@test.com');

      await User.create(preUser);

      const res = await chai.request(app)
        .post(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .send({ email: preUser.email, password: preUser.password });
      const user2Token = res.body.data.session.token;

      await chai.request(app)
        .post(`${eventPath}/${event.id}/players`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user2Token}`);

      const res2 = await chai.request(app)
        .delete(`${eventPath}/${event.id}/players/${user.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${userToken}`);

      expect(res2).to.be.json;
      expect(res2).to.have.status(204);
      expect(res2.body).to.be.empty;

      const dbEvent = await Event.findById(event.id);

      expect(dbEvent.status).to.be.equal(eventStatus.WAITING);
    });

    it('should return 401 unauthorized if the user is not authenticated', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${user.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${notValidToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(res.body.error.status).to.be.equal(401);
        expect(res.body.error.message).to.be.equal('authorization token not valid');
      }
    });

    it('should return 403 forbidden if the user to leave is no the same who sent the request', async () => {
      const preUser = test.createUser('user2@test.com');

      await User.create(preUser);

      const res = await chai.request(app)
        .post(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .send({ email: preUser.email, password: preUser.password });
      const user2Token = res.body.data.session.token;

      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${user.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user2Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res2 = e.response;

        expect(res2).to.be.json;
        expect(res2).to.have.status(403);
        expect(res2.body.error.status).to.be.equal(403);
        expect(res2.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 422 unprocessable entity when the playerId is not a valid mongoId', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${notValidMongoId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 not found when the user does not exist', async () => {
      await User.remove({});

      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${user.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

    it('should return 404 not found when the event does not exist', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${nonExistingId}/players/${user.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('event not found');
      }
    });

    it('should return 409 when the event status is not WAITING or FULL', async () => {
      event.status = eventStatus.DISPUTING;
      await event.save();

      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${user.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('you can\'t leave the event');
      }
    });

    it('should return 404 when the user does not belong to the event', async () => {
      const preUser2 = test.createUser('user2@test.com');
      const user2 = await User.create(preUser2);
      const res = await chai.request(app)
        .post(`${apiPath}/sessions`)
        .set('content-type', 'application/json')
        .send({ email: preUser2.email, password: preUser2.password });
      const user2Token = res.body.data.session.token;

      try {
        await chai.request(app)
          .delete(`${eventPath}/${event.id}/players/${user2.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user2Token}`);
      } catch (e) {
        const res2 = e.response;

        expect(res2).to.be.json;
        expect(res2).to.have.status(404);
        expect(res2.body.error.status).to.be.equal(404);
        expect(res2.body.error.message).to.be.equal('user not found in the event');
      }
    });
  });
});
