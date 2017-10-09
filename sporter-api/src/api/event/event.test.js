const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const Sport = require('../sport/sport.model');
const User = require('../user/user.model');
const Event = require('./event.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Events', () => {
  const eventPath = `${apiPath}/events`;
  const nonExistingId = '58ffc747a0033611f1f783a7';
  const farCoordinates = '-8.544844,42.878213';
  const nearCoordinates = '-8.4149298,43.3683169';
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
    it('should return 200, id and event info', async () => {
      const event = test.createEventPost(sport1.id);

      try {
        const res = await chai.request(app)
          .post(`${eventPath}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.data.event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
      } catch (e) {
        throw new Error(e);
      }
    });
  });

  describe('GET /events', () => {
    it('should return 200 and all events sorted when searching without query params', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
      expect(res.body.data.events[2].id).to.be.equal(event3.id);
      expect(res.body.data.events[3].id).to.be.equal(event4.id);
    });

    it('should return 200 and 2 events sorted with limit 2 and offset 0', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ limit: 2, offset: 1 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event sorted with limit 3 and offset 1', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ limit: 3, offset: 2 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0]).to.have.all.keys(['id', 'name', 'sport', 'description',
        'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
        'endingDate', 'createdAt', 'updatedAt']);
      expect(res.body.data.events[0].id).to.be.equal(event4.id);
    });

    it('should return 200 and 2 events sorted when finding by user1 id', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ userId: user1.id })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.host).to.be.equal(user1.id);
        expect(event.players.length).to.be.equal(1);
        expect(event.players[0]).to.be.equal(user1.id);
        expect(res.body.data.events[0].id).to.be.equal(event1.id);
        expect(res.body.data.events[1].id).to.be.equal(event2.id);
      });
    });

    it('should return 200 and 2 events when finding by sport1 id', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ sportId: sport1.id })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
        expect(event.sport).to.be.equal(sport1.id);
      });
    });

    it('should return 200 and 2 events sorted when finding by 1d away from today', async () => {
      const startDate = new Date();

      startDate.setDate(startDate.getDate() + 1);

      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ startDate })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(2);
      res.body.data.events.forEach((event) => {
        expect(event).to.have.all.keys(['id', 'name', 'sport', 'description',
          'intensity', 'paid', 'host', 'players', 'status', 'location', 'startDate',
          'endingDate', 'createdAt', 'updatedAt']);
      });
      expect(res.body.data.events[0].id).to.be.equal(event1.id);
      expect(res.body.data.events[1].id).to.be.equal(event2.id);
    });

    it('should return 200 and 1 event sorted when finding by 5d away from today', async () => {
      const startDate = new Date();

      startDate.setDate(startDate.getDate() + 5);

      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ startDate })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(1);
      expect(res.body.data.events[0].id).to.be.equal(event4.id);
    });

    it('should return 200 and 0 events sorted when finding by a far away distance', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ coordinates: farCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(0);
    });

    it('should return 200 and 4 events sorted when finding by maxDistance', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ coordinates: farCoordinates, maxDistance: longDistance })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
    });

    it('should return 200 and 4 events sorted when finding by default maxDistance', async () => {
      const res = await chai.request(app)
        .get(`${eventPath}`)
        .query({ coordinates: nearCoordinates })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.events.length).to.be.equal(4);
    });
  });
});

