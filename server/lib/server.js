
'use strict';

const Hapi = require('@hapi/hapi');
const { rejects } = require('assert');
const fs = require('fs').promises;
const Joi = require('joi');
const Path = require('path');
const { db } = require('../conf/couchdb');
const routes = require("./routes/routes");
const static_route = require("./routes/static");
const rides = require("./routes/rides");
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

server.route(routes.routes);
server.route(static_route.routes);
server.route(rides.routes);

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