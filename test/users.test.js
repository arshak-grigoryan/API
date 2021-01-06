const { describe, it } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const { decodeToken } = require('./_mocks');
const { admin, adminUpdated } = require('./_mocks/data');

const app = require('../src');

describe('GET /api/v1/users/all', () => {
  describe('Authorized', () => {
    it('admin user should get all users', async function () {
      await request(app).get('/api/v1/users/all')
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property('users');
          expect(res.body.users).to.be.an('array');
        });
    });
    it('non-admin user should get error', async function () {
      await request(app).get('/api/v1/users/all')
        .set('Authorization', `Bearer ${this.userToken}`)
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
  describe('Unauthorized', () => {
    it('get an error with status code 500', async () => {
      await request(app).get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
});

describe('GET /api/v1/users', () => {
  describe('Authorized', () => {
    it('get all users list from requester team', function (done) {
      request(app).get('/api/v1/users')
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property('users');
          expect(res.body.users).to.be.an('array');
          done();
        })
        .catch((err) => done(err));
    });
  });
  describe('Unauthorized', () => {
    it('get an error with status code 500', (done) => {
      request(app).get('/api/v1/users')
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
          done();
        })
        .catch((err) => done(err));
    });
  });
});

describe('GET /api/v1/users/{{user_id}}', () => {
  describe('Authorized', () => {
    it('get user by id', async function () {
      const user = await decodeToken(this.adminToken);
      await request(app).get(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property('user');
        });
    });
  });
  describe('Unauthorized', () => {
    it('get an error with status code 500', async function () {
      const { _id } = await decodeToken(this.adminToken);
      await request(app).put(`/api/v1/users/${_id}`)
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
});

describe('PUT /api/v1/users/{{user_id}}', () => {
  describe('Authorized', () => {
    it('update user', async function () {
      const adminUser = await decodeToken(this.adminToken);
      await request(app).put(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .send(adminUpdated)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property('user');
        });
    });
    it('should get an error on invalid email address', async function () {
      const adminUser = await decodeToken(this.adminToken);
      await request(app).put(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .send({ ...adminUpdated, email: 'Invalid' })
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
  describe('Unauthorized', () => {
    it('get an error with status code 500', async function () {
      const { _id } = await decodeToken(this.adminToken);
      await request(app).put(`/api/v1/users/${_id}`)
        .send(admin)
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
});

describe('DELETE /api/v1/users/{{user_id}}', () => {
  describe('Authorized', () => {
    it('delete user by id', async function () {
      const user = await decodeToken(this.userToken);
      await request(app).delete(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.property('msg');
        });
    });
    it('non admin user should get an error', async function () {
      const user = await decodeToken(this.userToken);
      await request(app).delete(`/api/v1/users/${user._id}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });
  describe('Unauthorized', () => {
    it('get an error with status code 500', async function () {
      const { _id } = await decodeToken(this.adminToken);
      await request(app).put(`/api/v1/users/${_id}`)
        .expect('Content-Type', /json/)
        .expect(500)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
});