const { describe, it, after } = require('mocha');
const request = require('supertest');
const { expect } = require('chai');
const { ErrorResponse } = require('../src/utils/errorResponse');

const { createChair, deleteChair } = require('./_mocks');

const app = require('../src');

let chair = {};
let chair2 = {};
let chair3 = {};

describe('chairs', () => {
  describe('POST /api/v1/chairs', () => {
    describe('Authorized', () => {
      it('admin user creates a chair', async function () {
        await request(app).post('/api/v1/chairs')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .send({ number: 12, table_id: this.table._id, prop: 'test' })
          .expect('Content-Type', /json/)
          .then((res) => {
            expect(res.body).to.have.property('data');
            chair = res.body.data;
          });
      });
      it('non-admin user shouldn\'t create a chair', async function () {
        await request(app).post('/api/v1/chairs')
          .set('Authorization', `Bearer ${this.userToken}`)
          .send({ number: 13, table_id: this.table._id, prop: 'test' })
          .expect('Content-Type', /json/)
          .then((res) => {
            chair2 = res.body.data;
            expect(res.body).not.to.have.property('data');
          });
      });
    });
    describe('Unauthorized', () => {
      it('should get an error with status code 401', async () => {
        await request(app).get('/api/v1/users/all')
          .expect('Content-Type', /json/)
          .expect(401)
          .then((res) => {
            expect(res.body).to.have.property('error');
          });
      });
    });
  });
  describe('GET /api/v1/chairs', () => {
    describe('Authorized', () => {
      it('admin user gets created chair', async function () {
        const { _id } = chair;
        await request(app).get(`/api/v1/chairs/${_id}`)
          .set('Authorization', `Bearer ${this.adminToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.an('object');
            expect(res.body.data).to.have.property('_id');
            expect(res.body.data).to.have.property('number');
          });
      });
      it('admin user gets all chairs', async function () {
        await request(app).get('/api/v1/chairs')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.an('array');
          });
      });
      it('non-admin user shouldn\'t get all chairs', async function () {
        await request(app).get('/api/v1/chairs')
          .set('Authorization', `Bearer ${this.userToken}`)
          .expect('Content-Type', /json/)
          .then((res) => {
            expect(res.body).to.have.property('error');
          });
      });
    });
    describe('Unauthorized', () => {
      it('should get an error with status code 401', async () => {
        await request(app).get('/api/v1/users/all')
          .expect('Content-Type', /json/)
          .expect(401)
          .then((res) => {
            expect(res.body).to.have.property('error');
          });
      });
    });
  });
  describe('PUT /api/v1/chairs{{chair_id}}', () => {
    it('admin user updates created chair', async function () {
      const { _id } = chair;
      await request(app).put(`/api/v1/chairs/${_id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .send({ number: 26 })
        .then((res) => {
          expect(res.body).to.have.property('data');
        });
    });
    it('non-admin user shouldn\'t be able to update a chair', async function () {
      const { _id } = chair;
      await request(app).put(`/api/v1/chairs/${_id}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .send({ number: 36 })
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
  describe('DELETE /api/v1/chairs{{chair_id}}', () => {
    it('admin user deletes created chair', async function () {
      const { _id } = chair;
      await request(app).delete(`/api/v1/chairs/${_id}`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .then((res) => {
          expect(res.body).to.have.property('message');
        });
    });
    it('non-admin user shouldn\'t be able to delete a chair', async function () {
      const { _id } = this.table;
      chair3 = await createChair(14, _id);
      await request(app).delete(`/api/v1/chairs/${chair3._id}`)
        .set('Authorization', `Bearer ${this.userToken}`)
        .then((res) => {
          expect(res.body).to.have.property('error');
        });
    });
  });
});
