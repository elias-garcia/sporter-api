const chai = require('chai');
const chaiHttp = require('chai-http');
const moment = require('moment');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const Sport = require('../sport/sport.model');
const User = require('../user/user.model');
const Event = require('./event.model');
const eventStatus = require('./event-status.enum');
const eventIntensity = require('./event-intensity.enum');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Events', () => {
  const eventPath = `${apiPath}/events`;
  const nonExistingId = '59f1b902020ca91a82c1eca3';
  const notValidMongoId = 'asdf1234';
  const farCoordinates = '42.878213,-8.544844';
  const nearCoordinates = '43.3683169,-8.4149298';
  const longDistance = 100;

  let sport1;
  let sport2;
  let user1;
  let user2;
  let user1Token;
  let event1;
  let event2;
  let event3;
  let event4;

  beforeEach(async () => {
    const preUser1 = test.createUser('user1@test.com');
    const preUser2 = test.createUser('user2@test.com');

    sport1 = await Sport.create(test.createSport('Tenis'));
    sport2 = await Sport.create(test.createSport('Baloncesto'));
    user1 = await User.create(preUser1);
    user2 = await User.create(preUser2);
    event1 = await Event.create(test.createEventDb(user1.id, sport1.id, 1));
    event2 = await Event.create(test.createEventDb(user1.id, sport2.id, 1));
    event3 = await Event.create(test.createEventDb(user2.id, sport1.id, 3));
    event4 = await Event.create(test.createEventDb(user2.id, sport2.id, 5));

    const res = await chai.request(app)
      .post(`${apiPath}/sessions`)
      .set('content-type', 'application/json')
      .send({ email: preUser1.email, password: preUser1.password });

    user1Token = res.body.data.session.token;
  });

  afterEach(async () => {
    await Event.remove({});
    await User.remove({});
    await Sport.remove({});
  });

  describe('POST /events', () => {
    it('should return 201, id and event info', async () => {
      const event = test.createEventPost(sport1.id);

      const res = await chai.request(app)
        .post(eventPath)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`)
        .send(event);

      expect(res).to.be.json;
      expect(res).to.have.status(201);
      expect(res.body.data.event).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.name).to.be.equal(event.name);
      expect(res.body.data.event.location[0]).to.be.equal(event.location[0]);
      expect(res.body.data.event.location[1]).to.be.equal(event.location[1]);
      expect(moment(res.body.data.event.startDate).toISOString())
        .to.be.equal(moment(event.startDate).toISOString());
      expect(moment(res.body.data.event.endingDate).toISOString())
        .to.be.equal(moment(event.endingDate).toISOString());
      expect(res.body.data.event.description).to.be.equal(event.description);
      expect(res.body.data.event.intensity).to.be.equal(eventIntensity.LOW);
      expect(res.body.data.event.fee).to.be.equal(event.fee);
      expect(res.body.data.event.status).to.be.equal(eventStatus.WAITING);
      expect(res.body.data.event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.sport.id).to.be.equal(sport1.id);
      expect(res.body.data.event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.host.id).to.be.equal(user1.id);
    });

    it('should return 422 unprocessable entity when the sportId is not a valid mongo id', async () => {
      const event = test.createEventPost(sport1.id);

      event.sport = notValidMongoId;

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the name is not a string', async () => {
      const event = test.createEventPost(sport1.id);

      event.name = 123;

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the location is not a valid pair of coordinates', async () => {
      const event = test.createEventPost(sport1.id);

      event.location = '(90, 129)';

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the description is not a string', async () => {
      const event = test.createEventPost(sport1.id);

      event.description = false;

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when maxPlayers is not an int >= 2', async () => {
      const event = test.createEventPost(sport1.id);

      event.maxPlayers = 1.923;

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the fee is not an int >= 0', async () => {
      const event = test.createEventPost(sport1.id);

      event.fee = -2;

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the intensity is not valid', async () => {
      const event = test.createEventPost(sport1.id);

      event.intensity = 'nothing';

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the startDate is before than now', async () => {
      const event = test.createEventPost(sport1.id);
      const now = moment();

      now.subtract(15, 'minutes');
      event.startDate = now.format();

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the endingDate is before than the startDate', async () => {
      const event = test.createEventPost(sport1.id);
      const now = moment();

      now.subtract(2, 'hours');
      event.endingDate = now.format();

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 not found when the sportId does not exist', async () => {
      const event = test.createEventPost(user1.id, nonExistingId);

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('sport not found');
      }
    });

    it('should return 404 not found when the userId does not exist', async () => {
      const event = test.createEventPost(user1.id, sport1.id);

      await user1.remove();

      try {
        await chai.request(app)
          .post(eventPath)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

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

  describe('GET /events', () => {
    it('should return 200 and all events sorted when searching without query params', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
      expect(res.body.data.events[2].id).to.be.equal(event3.id);
      expect(res.body.data.events[3].id).to.be.equal(event4.id);
    });

    it('should return 200 and 2 events sorted with limit 2 and offset 0', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ limit: 2, offset: 1 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event sorted with limit 3 and offset 1', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ limit: 3, offset: 2 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event4.id);
    });

    it('should return 200 and 2 events sorted when finding by user1 id', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ userId: user1.id })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 2 events when finding by sport1 id', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ sportId: sport1.id })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
        expect(event.sport.id).to.be.equal(sport1.id);
      });
    });

    it('should return 200 and 2 events sorted when finding by 1d away from today', async () => {
      const startDate = moment();

      startDate.add(1, 'day');

      const res = await chai.request(app)
        .get(eventPath)
        .query({ startDate: startDate.format() })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event sorted when finding by 5d away from today', async () => {
      const startDate = moment();

      startDate.add(5, 'days');

      const res = await chai.request(app)
        .get(eventPath)
        .query({ startDate: startDate.format() })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event4.id);
    });

    it('should return 200 and 0 events sorted when finding by a far away distance', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ location: farCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(0);
    });

    it('should return 200 and 4 events sorted when finding by maxDistance', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ location: farCoordinates, maxDistance: longDistance })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 4 events sorted when finding by default maxDistance', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ location: nearCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
    });

    it('should return 200 and 4 events sorted when finding by status', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ status: 'WAITING' })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event when finding by userId and sportId', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ userId: user1.id, sportId: sport1.id })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[0].sport.id).to.be.equal(sport1.id);
    });

    it('should return 200 and 1 event when finding by userId and startDate', async () => {
      const startDate = moment();

      startDate.add(3, 'days').format();

      const res = await chai.request(app)
        .get(eventPath)
        .query({ userId: user2.id, startDate: startDate.format() })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event3.id);
      expect(res.body.data.events[0].startDate).to.be.equal(event3.startDate.toISOString());
    });

    it('should return 200 and 1 event when finding by userId and coordinates', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ userId: user1.id, location: nearCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event when finding by sportId and startDate', async () => {
      const startDate = moment();

      startDate.add(3, 'days').format();

      const res = await chai.request(app)
        .get(eventPath)
        .query({ sportId: sport1.id, startDate: startDate.format() })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event3.id);
    });

    it('should return 200 and 2 events when finding by sportId and coordinates', async () => {
      const res = await chai.request(app)
        .get(eventPath)
        .query({ sportId: sport1.id, location: nearCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
        expect(event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
          'birthdate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event3.id);
    });

    it('should return 200 and 1 event when finding by startDate and coordinates', async () => {
      const startDate = moment();

      startDate.add(3, 'days');

      const res = await chai.request(app)
        .get(eventPath)
        .query({ startDate: startDate.format(), location: nearCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event3.id);
    });

    it('should return 422 unprocessable entity when the userId is not a valid mongo id', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ userId: notValidMongoId })
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

    it('should return 422 unprocessable entity when the sportId is not a valid mongo id', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ sportId: notValidMongoId })
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

    it('should return 422 unprocessable entity when startDate is not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ startDate: '2017-09-24T44:00:00+02:00' })
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

    it('should return 422 unprocessable entity when location are not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ location: '(12,0)' })
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

    it('should return 422 unprocessable entity when maxDistance is not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ maxDistance: 0 })
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

    it('should return 422 unprocessable entity when status is not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ status: 'wait' })
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

    it('should return 422 unprocessable entity when limit is not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ limit: 0 })
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

    it('should return 422 unprocessable entity when offset is not valid', async () => {
      try {
        await chai.request(app)
          .get(eventPath)
          .query({ offset: 0 })
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
  });

  describe('PUT /events', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(eventPath)
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

  describe('PATCH /events', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(eventPath)
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

  describe('DELETE /events', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(eventPath)
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

  describe('POST /events/:eventId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .post(`${eventPath}/${event1.id}`)
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

  describe('GET /events/:eventId', () => {
    it('should return 200 and the requested event', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}/${event1.id}`)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.event).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.id).to.be.equal(event1.id);
      expect(res.body.data.event.name).to.be.equal(event1.name);
      expect(res.body.data.event.description).to.be.equal(event1.description);
      expect(res.body.data.event.intensity).to.be.equal(event1.intensity);
      expect(res.body.data.event.paid).to.be.equal(event1.paid);
      expect(res.body.data.event.status).to.be.equal(event1.status);
      expect(res.body.data.event.location[0]).to.be.equal(event1.location.coordinates[1]);
      expect(res.body.data.event.location[1]).to.be.equal(event1.location.coordinates[0]);
      expect(res.body.data.event.startDate).to.be.equal(event1.startDate.toISOString());
      expect(res.body.data.event.endingDate).to.be.equal(event1.endingDate.toISOString());
      expect(res.body.data.event.createdAt).to.be.equal(event1.createdAt.toISOString());
      expect(res.body.data.event.updatedAt).to.be.equal(event1.updatedAt.toISOString());
    });

    it('should return 422 unprocessable entity when the eventId is not a valid mongo id', async () => {
      try {
        await chai.request(app)
          .get(`${eventPath}/${notValidMongoId}`)
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

    it('should return 404 when the eventId does not exist', async () => {
      try {
        await chai.request(app)
          .get(`${eventPath}/${nonExistingId}`)
          .set('content-type', 'application/json');

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('event not found');
      }
    });
  });

  describe('PUT /events/:eventId', () => {
    it('should return 200 and update the event', async () => {
      const event = test.createEventPost(sport2.id);

      event.name = 'Updated Event';
      event.description = 'Updated event description';
      event.intensity = eventIntensity.HIGH;
      event.paid = true;
      event.location = [39.12319, -20.98342];
      event.sportId = sport2.id;

      const res = await chai.request(app)
        .put(`${eventPath}/${event1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`)
        .send(event);

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.event).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'maxPlayers', 'fee', 'currencyCode', 'host', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.name).to.be.equal(event.name);
      expect(res.body.data.event.location[0]).to.be.equal(event.location[0]);
      expect(res.body.data.event.location[1]).to.be.equal(event.location[1]);
      expect(moment(res.body.data.event.startDate).toISOString())
        .to.be.equal(moment(event.startDate).toISOString());
      expect(moment(res.body.data.event.endingDate).toISOString())
        .to.be.equal(moment(event.endingDate).toISOString());
      expect(res.body.data.event.description).to.be.equal(event.description);
      expect(res.body.data.event.intensity).to.be.equal(eventIntensity.HIGH);
      expect(res.body.data.event.fee).to.be.equal(event.fee);
      expect(res.body.data.event.status).to.be.equal(eventStatus.WAITING);
      expect(res.body.data.event.sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.sport.id).to.be.equal(sport2.id);
      expect(res.body.data.event.host).to.have.all.keys(['id', 'email', 'firstName', 'lastName',
        'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.event.host.id).to.be.equal(user1.id);
    });

    it('should return 422 unprocessable entity when the sportId is not a valid mongo id', async () => {
      const event = test.createEventPost(sport1.id);

      event.sport = notValidMongoId;

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the name is not a string', async () => {
      const event = test.createEventPost(sport1.id);

      event.name = 123;

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the location is not a valid pair of coordinates', async () => {
      const event = test.createEventPost(sport1.id);

      event.location = '(90, 129)';

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the description is not a string', async () => {
      const event = test.createEventPost(sport1.id);

      event.description = false;

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when maxPlayers is not an int >= 2', async () => {
      const event = test.createEventPost(sport1.id);

      event.maxPlayers = 1.923;

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the fee is not an int >= 0', async () => {
      const event = test.createEventPost(sport1.id);

      event.fee = -2;

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the intensity is not valid', async () => {
      const event = test.createEventPost(sport1.id);

      event.intensity = 'nothing';

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the startDate is before than now', async () => {
      const event = test.createEventPost(sport1.id);
      const now = moment();

      now.subtract(15, 'minutes');
      event.startDate = now.format();

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the endingDate is before than the startDate', async () => {
      const event = test.createEventPost(sport1.id);
      const now = moment();

      now.subtract(2, 'hours');
      event.endingDate = now.format();

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 when the event does not exist', async () => {
      const event = test.createEventPost(sport1.id);

      try {
        await chai.request(app)
          .put(`${eventPath}/${nonExistingId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('event not found');
      }
    });

    it('should return 403 when the user who wants to update the event is not the owner', async () => {
      const event = test.createEventPost(sport1.id);
      const user = test.createUser();

      user.email = 'newTestEmail@test.com';

      User.create(user);

      try {
        const res = await chai.request(app)
          .post(`${apiPath}/sessions`)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });

        const userToken = res.body.data.session.token;

        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 409 when the status of the event is not WAITING', async () => {
      const event = test.createEventPost(sport1.id);

      event1.status = eventStatus.CANCELED;

      await event1.save();

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be updated');
      }
    });

    it('should return 409 when there are more than one player', async () => {
      const event = test.createEventPost(sport1.id);

      event1.players.push(user2.id);

      await event1.save();

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be updated');
      }
    });

    it('should return 409 when there are only one player and he is not the owner', async () => {
      const event = test.createEventPost(sport1.id);

      event1.players = [user2.id];

      await event1.save();

      try {
        await chai.request(app)
          .put(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be updated');
      }
    });
  });

  describe('PATCH /events', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(`${eventPath}/${event1.id}`)
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

  describe('DELETE /events/:eventId', () => {
    it('should return 204 and delete the event', async () => {
      const res = await chai.request(app)
        .delete(`${eventPath}/${event1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`);

      expect(res).to.be.json;
      expect(res).to.have.status(204);
    });

    it('should return 422 unprocessable entity when the eventId is not a valid mongo id', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${notValidMongoId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 403 not allowed when the user is not the event owner', async () => {
      const user = test.createUser();

      user.email = 'newTestEmail@test.com';

      User.create(user);

      try {
        const res = await chai.request(app)
          .post(`${apiPath}/sessions`)
          .set('content-type', 'application/json')
          .send({ email: user.email, password: user.password });

        const userToken = res.body.data.session.token;

        await chai.request(app)
          .delete(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${userToken}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });

    it('should return 404 when the event does not exist', async () => {
      try {
        await chai.request(app)
          .delete(`${eventPath}/${nonExistingId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`);

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
      try {
        event1.status = eventStatus.FULL;

        await event1.save();

        await chai.request(app)
          .delete(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be removed');
      }
    });

    it('should return 409 conflict when there are more than one player in the event', async () => {
      try {
        event1.players.push(user2.id);

        await event1.save();

        await chai.request(app)
          .delete(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be removed');
      }
    });

    it('should return 409 conflict when there are only one player and it\'s not the owner', async () => {
      try {
        event1.players = [user2.id];

        await event1.save();

        await chai.request(app)
          .delete(`${eventPath}/${event1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`);

        expect(true).to.be.false;
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(409);
        expect(res.body.error.status).to.be.equal(409);
        expect(res.body.error.message).to.be.equal('event can\'t be removed');
      }
    });
  });
});

