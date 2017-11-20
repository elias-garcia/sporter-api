const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const test = require('../../util/test');
const appConfig = require('../../config/app.config');
const Sport = require('./sport.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Sport', () => {
  const sportPath = `${apiPath}/sports`;

  let sport1;
  let sport2;
  let sport3;

  beforeEach(async () => {
    sport1 = await Sport.create(test.createSport('Baloncesto'));
    sport2 = await Sport.create(test.createSport('Fútbol'));
    sport3 = await Sport.create(test.createSport('Tenis'));
  });

  afterEach(async () => {
    await Sport.remove({});
  });

  describe('GET /sports', () => {
    it('should return 200 and all the sports sorted by name', async () => {
      const res = await chai.request(app)
        .get(sportPath)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.sports.length).to.be.equal(3);
      await Promise.all(res.body.data.sports.map(async (sport) => {
        expect(sport).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);
      }));
      expect(res.body.data.sports[0].id).to.be.equal(sport1.id);
      expect(res.body.data.sports[1].id).to.be.equal(sport2.id);
      expect(res.body.data.sports[2].id).to.be.equal(sport3.id);
    });
  });

  describe('PUT /sports', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(sportPath)
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

  describe('PATCH /sports', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(sportPath)
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

  describe('DELETE /sports', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(sportPath)
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
});
