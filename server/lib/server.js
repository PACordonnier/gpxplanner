
'use strict';

const Hapi = require('@hapi/hapi');
const { rejects } = require('assert');
const fs = require('fs').promises;
const Joi = require('joi');
const Path = require('path');
const { db } = require('../conf/couchdb');
const nano = require('nano')(db.connection_string);
const routes_db = nano.use('routes');
const rides_db = nano.use('rides');
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
      try {
        const response = await routes_db.find(q);
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
  path: '/route',
  config: {
    handler: (request, h) => {
      // TODO Check if it's correct GPX
      return fs.writeFile("db/" + request.payload.name + ".gpx", Buffer.from(request.payload.route, 'base64'))
      .then(() => {
        return routes_db.insert({ path: request.payload.name + ".gpx", name: request.payload.name, owner: 1});
      });
    },

    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        route: Joi.string().base64().required()
      })
    }
  },
})

server.route({
  method: 'GET',
  path: '/route/{id}',
  config: {
    handler: (request, h) => {
      return routes_db.get(request.params.id)
      .catch((error) => {
        return Boom.notFound('Id not found in database');
      })
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required()
      })
    } 
  }
});

server.route({
  method: 'GET',
  path: '/static/gpx/{id}',
  config: {
    handler: async (request, h) => {
      try {
        await routes_db.get(request.params.id);
      }
      catch (error) {
        throw Boom.notFound('Id not found in database');
      }
      return h.file((await routes_db.get(request.params.id)).path);
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