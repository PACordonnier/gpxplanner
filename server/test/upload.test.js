'use strict';

const fs = require('fs');
const path = require('path');
const Lab = require('@hapi/lab');
const FormData = require('form-data');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');
const GetStream = require('get-stream');

describe('POST /upload', () => {
    let server;

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('responds with 200', async () => {
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
        
    });
});
