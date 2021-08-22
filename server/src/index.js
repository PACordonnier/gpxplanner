
'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const Joi = require('joi')
const nano = require('nano')('http://admin:password@localhost:5984');

const init = async () => {

  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

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
          let promises = new Promise(
            resolve => writeStream.on('finish', () => writeStream.close(() => resolve("Upload successful !")))
          ).then(gpxplanner.insert({ path: "db/" + payload.name + ".gpx", name: payload.name, date: payload.date }))

      

          return promises
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

    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();