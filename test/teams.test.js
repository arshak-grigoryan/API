/* eslint-disable prefer-arrow-callback */
const { describe, it, beforeEach, after } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const { Team } = require('booking-db');

const app = require('../src');

describe.skip('teams', async () => {
  describe('GET /api/v1/teams', () => {
    it('admin user should get all teams data', function (done) {
      request(app)
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('data');
          expect(res.body).to.have.property('count');
          expect(res.body).to.have.property('pagination');
          expect(res.body.data).to.be.an('array');
          expect(res.body.count).to.be.an('number');
          expect(res.body.pagination).to.be.an('object');
          done();
        });
    });

    it('non-admin user should not get team\'s data', function (done) {
      request(app)
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${this.userToken}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /api/v1/teams/:team_id', () => {
    it('admin user should get team data requested with team id', function (done) {
      request(app)
        .get(`/api/v1/teams/${this.team._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.data.team_name).to.be.equal(this.team.team_name);
          done();
        });
    });

    it('non-admin user should not get requested team data', function (done) {
      // const requestedTeam = await getTeam(team.team_name);
      request(app)
        .get(`/api/v1/teams/${this.team._id}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('POST /api/v1/teams', () => {
    describe('Authorized', () => {
      const testTeamName = 'test team 78';

      it('should create new team with the given team name', function (done) {
        this.timeout(5000);
        request(app)
          .post('/api/v1/teams')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .send({ team_name: testTeamName })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.data.team_name).to.be.equal(testTeamName);
            done();
          });
      });
      it('should get error 400 when creating team with same name', function (done) {
        this.timeout(5000);
        request(app)
          .post('/api/v1/teams')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .send({ team_name: testTeamName })
          .expect(400)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      after('delete created team', () => Team.deleteOne({ team_name: testTeamName }));
    });

    describe('Unauthorized', () => {
      const unauthTestTeamName = 'unauth test team 12';

      it('should not get the team data - USER', function (done) {
        this.timeout(5000);
        request(app)
          .post('/api/v1/teams')
          .set('Authorization', `Bearer ${this.userToken}`)
          .send({ team_name: unauthTestTeamName })
          .expect(401)
          .end((err, res) => {
            if (err) return done(err);
            done();
          });
      });

      after('delete the team if created', () => Team.deleteOne({ team_name: unauthTestTeamName }));
    });
  });

  describe('PUT /api/v1/teams/:team_id', () => {
    const newTeamName = 'test new team name';
    let teamId;

    it('should update team name', function (done) {
      // const requestedTeam = await getTeam(team.team_name);
      teamId = this.team._id;
      request(app)
        .get(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .send(JSON.stringify({ team_name: newTeamName }))
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.not.have.property('error');
          done();
        });
    });

    it('should not update team name - USER', function (done) {
      request(app)
        .get(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .send(JSON.stringify({ team_name: 'newTeamName2' }))
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('error');
        });
    });
  });

  describe('DELETE /api/v1/teams/:team_id', () => {
    let newTeam;
    const newTeamName = 'Team delete Test 48';
    beforeEach('creating team to delete', async () => {
      newTeam = await Team.create({
        team_name: newTeamName,
      });
    });

    it('should delete team', function (done) {
      request(app)
        .delete(`/api/v1/teams/${newTeam._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('should not delete team - USER', function (done) {
      request(app)
        .delete(`/api/v1/teams/${newTeam._id}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    after('delete team if not deleted', () => Team.deleteOne({ team_name: newTeamName }));
  });
});
