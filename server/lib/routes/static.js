
const { db } = require('../../conf/couchdb');
const nano = require('nano')(db.connection_string);
const routes_db = nano.use('routes');
const Boom = require('@hapi/boom');

module.exports.routes = [
{
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
  }
}
]