`use strict`;

const { start, close } = require('../lib/couchdb');

start(5984, "gpxplanner");
