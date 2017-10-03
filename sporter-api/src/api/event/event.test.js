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
  const nonExistingEventId = '58ffc747a0033611f1f783a7';

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
    event1 = await Event.create(test.createEventDb(user1._id, sport1._id));
    event2 = await Event.create(test.createEventDb(user1._id, sport2._id));
    event3 = await Event.create(test.createEventDb(user2._id, sport1._id));
    event4 = await Event.create(test.createEventDb(user2._id, sport2._id));

    const res = await chai.request(app)
      .post(`${apiPath}/sessions`)
      .set('content-type', 'application/json')
      .send({ email: preUser1.email, password: preUser1.password });

    user1Token = res.body.data.session.token;
  });
/*
  describe('POST /events', function () {

    it('should return 200, id and event info', async function () {
      const event = test.createEventPost(sport1._id);

      try {
        const res = await chai.request(app)
          .post(`${eventPath}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(event);

        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(res.body.data.event).to.have.all.keys(
          ['name', 'location', 'sport', 'start_date', 'ending_date',
            'description', 'intensity', 'paid', 'status', 'host', 'players']);
      } catch (e) {
        throw new Error(e);
      }
    });

  });

    describe('GET /events', () => {

      it('should return 200 when searching all events', (done) => {
        chai.request(app)
          .get(`${eventPath}`)
          .set('content-type', 'application/json')
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.data.events.length).to.be.equal(1);
            console.log(JSON.stringify(res.body.data));
            expect(res.body.data.events[0]).to.have.all.keys(
              ['_id', 'name', 'location', 'sport', 'start_date', 'ending_date',
                'description', 'intensity', 'paid', 'status', 'host', 'players',
                'created_at', 'updated_at']);
            done();
          });
      });

    });
  */
});
