const Joi = require('joi');
const { db } = require('../../conf/couchdb');
const nano = require('nano')(db.connection_string);
const routes_db = nano.use('routes');
const rides_db = nano.use('rides');
const fs = require('fs').promises;
const Boom = require('@hapi/boom');

module.exports.routes = [
{
  method: 'POST',
  path: '/rides',
  config: {
    handler: (request, h) => {
      return routes_db.get(request.payload.route).then(() => {
        return rides_db.insert({ date: request.payload.date.getTime()/1000, name: request.payload.name, route: request.payload.route});
      })
      .catch((err) => {
        if(err.statusCode = 404){
          return Boom.badRequest('Request route does not exist');
        }
        else {
          return err
        }
      })
    },

    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        route: Joi.string().required(),
        date: Joi.date().iso().required()
      })
    }
  }
},
{
  method: 'GET',
  path: '/rides/{id}',
  config: {
    handler: (request, h) => {
      return rides_db.get(request.params.id)
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
  path: '/rides',
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
        const response = await rides_db.find(q);
        return h.response(response.docs);
      }
      catch (error) {
        console.log(error);
        throw error
      }
    },

    validate: {
      query: Joi.object({
        name: Joi.string(),
        date: Joi.date().iso()
      }),
    }
  }
}
]