
'use strict';

const Hapi = require('@hapi/hapi');
const { rejects } = require('assert');
const fs = require('fs');
const Joi = require('joi');
const Path = require('path');
const { db } = require('../conf/couchdb');
const nano = require('nano')(db.connection_string);
const gpxplanner = nano.use('gpxplanner');
const Boom = require('@hapi/boom');

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
  method: 'GET',
  path: '/query',
  config: {
    handler: async (request, h) => {
      var selector = {}
      Object.keys(request.query).forEach((key) => {
        selector[key] = { "$eq" : request.query[key] instanceof Date ? request.query[key].getTime()/1000 : request.query[key]};
      });
      var q = {
        "selector": selector
      };
      console.log(q);
      try {
        const response = await gpxplanner.find(q);
        return h.response(response.docs);
      }
      catch (error) {
        console.log(error);
        throw error
      }
      
    },

    validate: {
      query: Joi.object({
          date: Joi.date().iso(),
          name: Joi.string()
      })
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
      // nano.db.create('gpxplanner')
      // const gpxplanner = nano.use('gpxplanner')
      // const response = await gpxplanner.insert({ path: "db/" + payload.name + ".gpx", name: payload.name, date: payload.date })
      return new Promise(resolve => {
        writeStream.on('finish', () => writeStream.close(() => (resolve())))
      }).then((result) => gpxplanner.insert({ path: payload.name + ".gpx", name: payload.name, date: payload.date.getTime()/1000, owner: 1}))
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
          date: Joi.date().iso().required()
      })
    }

  },
})

server.route({
  method: 'GET',
  path: '/static/gpx/{id}',
  config: {
    handler: async (request, h) => {
      try {
        await gpxplanner.get(request.params.id);
      }
      catch (error) {
        throw Boom.notFound('Id not found in database');
      }
      return h.file((await gpxplanner.get(request.params.id)).path);
    },
    // validate: {
    //   params: Joi.object({
    //     id: Joi.string().required()
    //   })
    // } 
  }
});

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
  await server.register(require('@hapi/inert'));
  return server;
}

exports.start = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};

exports.initStart = async () => {
  await server.initialize();
  await server.register(require('@hapi/inert'));
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});