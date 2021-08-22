
'use strict';

const Hapi = require('@hapi/hapi');
const fs = require('fs');
const Joi = require('joi')

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
          let writeStream = fs.createWriteStream('db/route.gpx');

          const payload = request.payload;
          console.log(payload);

          payload.upload.pipe(writeStream)
          
          return new Promise(resolve => writeStream.on('finish', () => writeStream.close(() => resolve("Upload successful !"))))
        },

      payload: {
        maxBytes: 209715200,
        output: 'stream',
        parse: true,
        multipart: true
      },
      
      validate: {
        payload: Joi.object({
            name: Joi.string().required(),
            upload: Joi.required()
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