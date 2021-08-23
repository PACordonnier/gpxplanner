
'use strict';

const Hapi = require('@hapi/hapi');
const { rejects } = require('assert');
const fs = require('fs');
const Joi = require('joi');
const Path = require('path');
const nano = require('nano')('http://admin:password@localhost:5984');


const server = Hapi.server({
  port: 3000,
  host: 'localhost',
  routes: {
    files: {
        relativeTo: Path.join(__dirname, '../db')
    }
  }
})

server.route({
  method: 'POST',
  path: '/upload',
  config: {
    handler: (request, h) => {

        const payload = request.payload;
        let writeStream = fs.createWriteStream("db/" + payload.name + ".gpx");

        payload.upload.pipe(writeStream);
        const gpxplanner = nano.use('gpxplanner');
        // nano.db.create('gpxplanner')
        // const gpxplanner = nano.use('gpxplanner')
        // const response = await gpxplanner.insert({ path: "db/" + payload.name + ".gpx", name: payload.name, date: payload.date })
        return new Promise(resolve => {
          writeStream.on('finish', () => writeStream.close(() => (resolve())))
        }).then((result) => gpxplanner.insert({ path: payload.name + ".gpx", name: payload.name, date: payload.date }, "1"))
        .then((result) => new Promise((resolve) => resolve({ coucou: "coucou"})))
        .catch((err) => console.log(err))

      },

    payload: {
      maxBytes: 209715200,
      output: 'stream',
      parse: true,
      multipart: true
    },

    validate: {
      payload: Joi.object({
          name: Joi.string().alphanum().required(),
          upload: Joi.required(),
          date: Joi.date().required()
      })
    }

  },
})

server.route({
  method: 'GET',
  path: '/static',
  config: {
    handler: (request, h) => {
      return h.file('coucou.gpx');
    }
  } 
})

server.route({
  method: 'GET',
  path: '/',
  config: {
    handler: (request, h) => {
      return "Hello World !"
    }
  } 
})

exports.init = async () => {
  await server.initialize();
  return server;
}

exports.start = async () => {
  await server.register(require('@hapi/inert'));
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});