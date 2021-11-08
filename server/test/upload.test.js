'use strict';

const fs = require('fs');
const path = require('path');
const Lab = require('@hapi/lab');
const FormData = require('form-data');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it, before, after} = exports.lab = Lab.script();
const { init } = require('../lib/server');
const GetStream = require('get-stream');
const mockCouch = require('mock-couch').createServer();

describe('POST /upload', () => {
    let server;
    let id;

    before(async () => {
      // mockCouch.listen(5984, function() {});
      // mockCouch.addDB('gpxplanner', []);
      // console.log('CouchDB started !');
    });

    after(async () => {
      // mockCouch.close()
    }),

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('responds with 404 when no gpx', async () => {
      const res = await server.inject({
          method: 'get',
          url: '/static/gpx/1',
      });
      expect(res.statusCode).to.equal(404);
    });

    it('responds with 200 when posting a gpx', async () => {
        const form = new FormData();
        form.append('upload', fs.createReadStream(path.join(__dirname, '../res/tour.gpx')));
        form.append('name', 'tour');
        form.append('date', '2021-01-23');
        const res = await server.inject({
            method: 'post',
            url: '/upload',
            headers: form.getHeaders(),
            payload: await GetStream(form)
        });
        expect(res.statusCode).to.equal(200);
        id = res.result.id
    });

    it('responds with 200 when retrieving a gpx', async () => {
      const res = await server.inject({
          method: 'get',
          url: `/static/gpx/${id}`,
      });
      expect(res.statusCode).to.equal(200);
      // expect res.content to be content uploaded previously
    });

});
