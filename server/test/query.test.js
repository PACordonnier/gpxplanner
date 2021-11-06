
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

describe('Queries data', () => {
    let server;
    let id;

    before(async () => {
    });

    after(async () => {
      mockCouch.close()
    }),

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('returns nothing', async () => {
      const res = await server.inject({
          method: 'get',
          url: '/query?date=2021-10-02',
      });
      expect(res.statusCode).to.equal(200);
    });
    it('returns something', async () => {
      const form = new FormData();
      form.append('upload', fs.createReadStream(path.join(__dirname, '../res/tour.gpx')));
      form.append('name', 'tour');
      form.append('date', '2019-01-23');
      console.log(form.getHeaders());
      await server.inject({
          method: 'post',
          url: '/upload',
          headers: form.getHeaders(),
          payload: await GetStream(form)
      });
      const res = await server.inject({
        method: 'get',
        url: '/query?date=2019-01-23',
      });
      console.log(res.statusCode);
      expect(res.statusCode).to.equal(200) &&
      expect(res.result).not.empty();
    })
});
