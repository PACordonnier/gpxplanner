
const Joi = require('joi');
const { db } = require('../../conf/couchdb');
const nano = require('nano')(db.connection_string);
const routes_db = nano.use('routes');
const fs = require('fs').promises;
const Boom = require('@hapi/boom');

module.exports.routes = [
{
  method: 'POST',
  path: '/routes',
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
  }
},
{
  method: 'GET',
  path: '/routes/{id}',
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
},
{
  method: 'GET',
  path: '/routes',
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
        name: Joi.string()
      })
    }
  }
}
]