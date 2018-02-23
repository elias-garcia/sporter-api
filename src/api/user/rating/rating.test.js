const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const test = require('../../../util/test');
const appConfig = require('../../../config/app.config');
const User = require('../user.model');
const Rating = require('./rating.model');

const { expect } = chai;
const apiPath = appConfig.path;

chai.use(chaiHttp);

describe('Ratings', () => {
  const ratingPath = `${apiPath}/users`;
  const nonExistingId = '59f1b902020ca91a82c1eca3';
  const notValidMongoId = 'asdf1234';

  let user1;
  let user2;
  let user1Token;
  let rating1;

  beforeEach(async () => {
    const preUser1 = test.createUser('user1@test.com');
    const preUser2 = test.createUser('user2@test.com');

    user1 = await User.create(preUser1);
    user2 = await User.create(preUser2);

    rating1 = await Rating.create(test.createRatingDb(user1.id, user2.id, 2));
    await Rating.create(test.createRatingDb(user1.id, user2.id, 2));
    await Rating.create(test.createRatingDb(user1.id, user2.id, 2));
    await Rating.create(test.createRatingDb(user1.id, user2.id, 2));
    await Rating.create(test.createRatingDb(user1.id, user2.id, 3));
    await Rating.create(test.createRatingDb(user1.id, user2.id, 3));

    const res1 = await chai.request(app)
      .post(`${apiPath}/sessions`)
      .set('content-type', 'application/json')
      .send({ email: preUser1.email, password: preUser1.password });

    user1Token = res1.body.data.session.token;
  });

  afterEach(async () => {
    await User.remove({});
    await Rating.remove({});
  });

  describe('POST /users/:userId/ratings', async () => {
    it('should return 201 and the created rating', async () => {
      const rating = test.createRatingPost(3);

      const res = await chai.request(app)
        .post(`${ratingPath}/${user2.id}/ratings`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`)
        .send(rating);

      expect(res).to.be.json;
      expect(res).to.have.status(201);
      expect(res.body.data.rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
      expect(res.body.data.rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.rating.to).to.be.equal(user2.id);
      expect(res.body.data.rating.score).to.be.equal(3);
      expect(res.body.data.rating.comment.length).to.be.equal(1);
      expect(res.body.data.rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
      expect(res.body.data.rating.comment[0].version).to.be.equal(0);
      expect(res.body.data.rating.comment[0].value).to.be.equal('Comment');
    });

    it('should return 422 unprocessable entity when the userId is not a valid mongo id', async () => {
      const rating = test.createRatingPost(3);

      try {
        await chai.request(app)
          .post(`${ratingPath}/${notValidMongoId}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is not a number', async () => {
      const rating = test.createRatingPost('2');

      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is not an int', async () => {
      const rating = test.createRatingPost(3.2);

      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is > 5', async () => {
      const rating = test.createRatingPost(6);

      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is < 0', async () => {
      const rating = test.createRatingPost(-1);

      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the comment is not an string', async () => {
      const rating = test.createRatingPost(-0.1);

      rating.comment = 2;

      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 not found when the user does not exist', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .post(`${ratingPath}/${nonExistingId}/ratings`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });
  });

  describe('PUT /users/:userId/ratings', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings`)
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

  describe('PATCH /users/:userId/ratings', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(`${ratingPath}/${user2.id}/ratings`)
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

  describe('DELETE /users/:userId/ratings', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .delete(`${ratingPath}/${user2.id}/ratings`)
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

  describe('POST /users/:userId/ratings/:ratingId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .post(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
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

  describe('GET /users/:userId/ratings', async () => {
    it('should return 200 and all ratings', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(6);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 200 and all ratings paginated', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .query({ limit: 2, offset: 1 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(2);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 200 and all ratings paginated', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .query({ limit: 2, offset: 2 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(2);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 200 and all ratings filtered by score', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .query({ score: 2 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(4);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 200 and all ratings filtered by score and paginated', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .query({ score: 2, limit: 3, offset: 1 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(3);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 200 and all ratings filtered by score and paginated', async () => {
      const res = await chai.request(app)
        .get(`${ratingPath}/${user2.id}/ratings`)
        .query({ score: 2, limit: 3, offset: 2 })
        .set('content-type', 'application/json');

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.ratings.length).to.be.equal(1);
      res.body.data.ratings.forEach((rating) => {
        expect(rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
        expect(rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
        expect(rating.to).to.be.equal(user2.id);
        expect(rating.comment.length).to.be.equal(1);
        expect(rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
        expect(rating.comment[0].version).to.be.equal(0);
        expect(rating.comment[0].value).to.be.equal('Comment');
      });
    });

    it('should return 422 unprocessable entity if score is not an int', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ score: 4.3 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if score is > 5', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ score: 6 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if score is < 0', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ score: -1 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if score is < 0', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ score: -1 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if limit is not an int', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ limit: 1.2 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if limit is < 1', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ limit: -1 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if offset is not an int', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ offset: 1.2 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity if limit is < 1', async () => {
      try {
        await chai.request(app)
          .get(`${ratingPath}/${nonExistingId}/ratings`)
          .query({ offset: -1 })
          .set('content-type', 'application/json');
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });
  });

  describe('PUT /users/:userId/ratings/:ratingId', async () => {
    it('should return 200 and the updated rating', async () => {
      const rating = test.createRatingPost(4);

      rating.comment = 'Updated comment';

      const res = await chai.request(app)
        .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`)
        .send(rating);

      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body.data.rating).to.have.all.keys(['id', 'from', 'to', 'score', 'comment']);
      expect(res.body.data.rating.from).to.have.all.keys(['id', 'email', 'firstName', 'lastName', 'birthdate', 'createdAt', 'updatedAt']);
      expect(res.body.data.rating.to).to.be.equal(user2.id);
      expect(res.body.data.rating.score).to.be.equal(4);
      expect(res.body.data.rating.comment.length).to.be.equal(2);
      expect(res.body.data.rating.comment[0]).to.have.all.keys(['version', 'value', 'date']);
      expect(res.body.data.rating.comment[0].version).to.be.equal(0);
      expect(res.body.data.rating.comment[0].value).to.be.equal('Comment');
      expect(res.body.data.rating.comment[1]).to.have.all.keys(['version', 'value', 'date']);
      expect(res.body.data.rating.comment[1].version).to.be.equal(1);
      expect(res.body.data.rating.comment[1].value).to.be.equal('Updated comment');
    });

    it('should return 422 unprocessable entity when the userId is not a valid mongo id', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${notValidMongoId}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the ratingId is not a valid mongo id', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${notValidMongoId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is not a number', async () => {
      const rating = test.createRatingPost('2');

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is not an int', async () => {
      const rating = test.createRatingPost(3.2);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is > 5', async () => {
      const rating = test.createRatingPost(6);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the score is < 0', async () => {
      const rating = test.createRatingPost(-1);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 422 unprocessable entity when the comment is not an string', async () => {
      const rating = test.createRatingPost(-0.1);

      rating.comment = 2;

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(422);
        expect(res.body.error.status).to.be.equal(422);
        expect(res.body.error.message).to.be.equal('unprocessable entity');
      }
    });

    it('should return 404 not found when the user does not exist', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${nonExistingId}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('user not found');
      }
    });

    it('should return 404 not found when the rating does not exist', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${nonExistingId}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(res.body.error.status).to.be.equal(404);
        expect(res.body.error.message).to.be.equal('rating not found');
      }
    });

    it('should return 403 not allowed when the user who send the request is not the same who creates the rating', async () => {
      const rating = test.createRatingPost(5);

      try {
        await chai.request(app)
          .put(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
          .set('content-type', 'application/json')
          .set('authorization', `Bearer ${user1Token}`)
          .send(rating);
      } catch (e) {
        const res = e.response;

        expect(res).to.be.json;
        expect(res).to.have.status(403);
        expect(res.body.error.status).to.be.equal(403);
        expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
      }
    });
  });

  describe('PATCH /users/:userId/ratings/:ratingId', () => {
    it('should return 501, not implemented', async () => {
      try {
        await chai.request(app)
          .patch(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
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

  describe('DELETE /users/:userId/ratings/:ratingId', async () => {
    it('should return 204 and empty response', async () => {
      const res = await chai.request(app)
        .delete(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`);

      expect(res).to.be.json;
      expect(res).to.have.status(204);
    });
  });

  it('should return 404 not found when the user does not exist', async () => {
    try {
      await chai.request(app)
        .delete(`${ratingPath}/${nonExistingId}/ratings/${rating1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`);
    } catch (e) {
      const res = e.response;

      expect(res).to.be.json;
      expect(res).to.have.status(404);
      expect(res.body.error.status).to.be.equal(404);
      expect(res.body.error.message).to.be.equal('user not found');
    }
  });

  it('should return 404 not found when the rating does not exist', async () => {
    try {
      await chai.request(app)
        .delete(`${ratingPath}/${user2.id}/ratings/${nonExistingId}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`);
    } catch (e) {
      const res = e.response;

      expect(res).to.be.json;
      expect(res).to.have.status(404);
      expect(res.body.error.status).to.be.equal(404);
      expect(res.body.error.message).to.be.equal('rating not found');
    }
  });

  it('should return 403 not allowed when the user who send the request is not the same who creates the rating', async () => {
    try {
      await chai.request(app)
        .delete(`${ratingPath}/${user2.id}/ratings/${rating1.id}`)
        .set('content-type', 'application/json')
        .set('authorization', `Bearer ${user1Token}`);
    } catch (e) {
      const res = e.response;

      expect(res).to.be.json;
      expect(res).to.have.status(403);
      expect(res.body.error.status).to.be.equal(403);
      expect(res.body.error.message).to.be.equal('you are not allowed to access this resource');
    }
  });
});
