/* jshint expr: true */
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const Sport = require('../sport/sport.model');
const User = require('../user/user.model');
const Event = require('./event.model');
const expect = chai.expect;
const apiPath = appConfig.path;

chai.use(chaiHttp);

let sport;
let user;
const nonExistingEventId = '58ffc747a0033611f1f783a7';

describe('Events', () => {

  before((done) => {
    sport = test.createSport();
    user = test.createUser();

    Sport.create(sport, (err, doc) => {
      User.create(user, (err, doc) => {
        chai.request(app)
          .get(`${apiPath}/users`)
          .set('content-type', 'application/json')
          .end((err, res) => {
            expect(res).to.be.json;
            expect(res).to.have.status(405);
            expect(res.body.error.status).to.be.equal(405);
            expect(res.body.error.message).to.be.equal('method not allowed');
            done();
          });
      });
    });
  });

  afterEach((done) => {
    Event.remove({ }, () => {
      done();
    });
  });

  describe('GET /events', () => {

    it('should return 405, method not allowed', (done) => {
      chai.request(app)
        .get(`${apiPath}/events`)
        .set('content-type', 'application/json')
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(405);
          expect(res.body.error.status).to.be.equal(405);
          expect(res.body.error.message).to.be.equal('method not allowed');
          done();
        });
    });

  });

  describe('POST /events', () => {

    it('should return 200, id and event info', (done) => {
      chai.request(app)
        .post(`${apiPath}/events`)
        .send(user)
        .end((err, res) => {
          expect(res).to.be.json;
          expect(res).to.have.status(200);
          expect(res.body.data.session).to.have.all.keys(
            ['name', 'location', 'sport', 'start_date', 'ending_date',
            'description', 'intensity', 'paid', 'status', 'host', 'players']);
          done();
        });
    });

  });

});