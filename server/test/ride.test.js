'use strict';

const fs = require('fs');
const path = require('path');
const Lab = require('@hapi/lab');
const FormData = require('form-data');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it, before, after} = exports.lab = Lab.script();
const { init } = require('../lib/server');

describe('Use rides', () => {
  let server;
  let route_id, ride_id;

  before(async () => {
    server = await init();
  });

  after(async () => {
    await server.stop();
  }),

  beforeEach(async () => {
  });

  afterEach(async () => {
  });

  it('responds with 404 when no ride found', async () => {
    const res = await server.inject({
        method: 'get',
        url: '/rides/1',
    });
    expect(res.statusCode).to.equal(404);
  });

  it('responds with 400 when route does not exist', async () => {
    const res = await server.inject({
      method: 'post',
      url: '/rides',
      payload: {name: "Ride du mercredi", date: "2021-11-11", route: `foobar`}
    });
    ride_id = res.result.id;
    expect(res.statusCode).to.equal(400);
  });

  it('responds with 200 when posting a ride', async () => {
    var res = await server.inject({
      method: 'post',
      url: '/routes',
      payload: {name: "tour", route: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGdweCBjcmVhdG9yPSJTdHJhdmFHUFgiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTpzY2hlbWFMb2NhdGlvbj0iaHR0cDovL3d3dy50b3BvZ3JhZml4LmNvbS9HUFgvMS8xIGh0dHA6Ly93d3cudG9wb2dyYWZpeC5jb20vR1BYLzEvMS9ncHgueHNkIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnRvcG9ncmFmaXguY29tL0dQWC8xLzEiPgogPG1ldGFkYXRhPgogIDxuYW1lPlRvdXIgU29pciBTdWQgPC9uYW1lPgogIDxhdXRob3I+CiAgIDxuYW1lPlBhdWwtQWRyaWVuIENvcmRvbm5pZXI8L25hbWU+CiAgIDxsaW5rIGhyZWY9Imh0dHBzOi8vd3d3LnN0cmF2YS5jb20vYXRobGV0ZXMvMzMwMzM4NzkiLz4KICA8L2F1dGhvcj4KICA8Y29weXJpZ2h0IGF1dGhvcj0iT3BlblN0cmVldE1hcCBjb250cmlidXRvcnMiPgogICA8eWVhcj4yMDIwPC95ZWFyPgogICA8bGljZW5zZT5odHRwczovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHQ8L2xpY2Vuc2U+CiAgPC9jb3B5cmlnaHQ+CiAgPGxpbmsgaHJlZj0iaHR0cHM6Ly93d3cuc3RyYXZhLmNvbS9yb3V0ZXMvMjg1ODc0NDM1MjYwNzE5OTg1NCIvPgogPC9tZXRhZGF0YT4KIDx0cms+CiAgPG5hbWU+VG91ciBTb2lyIFN1ZCA8L25hbWU+CiAgPGxpbmsgaHJlZj0iaHR0cHM6Ly93d3cuc3RyYXZhLmNvbS9yb3V0ZXMvMjg1ODc0NDM1MjYwNzE5OTg1NCIvPgogIDx0eXBlPlJpZGU8L3R5cGU+CiAgPHRya3NlZz4KICAgPHRya3B0IGxhdD0iNDguODI0NDkwMDAwMDAwMDA0IiBsb249IjIuMzE5MTUiPgogICAgPGVsZT43Mi4wODwvZWxlPgogICA8L3Rya3B0PgogIDwvdHJrc2VnPgogPC90cms+CjwvZ3B4Pgo="}
    });
    route_id = res.result.id;
    res = await server.inject({
      method: 'post',
      url: '/rides',
      payload: {name: "Ride du mercredi", date: "2021-11-10", route: `${route_id}`}
    });
    ride_id = res.result.id;
    expect(res.statusCode).to.equal(200);
  });

  it('responds with 200 when getting a ride', async () => {
    const res = await server.inject({
        method: 'get',
        url: `/rides/${ride_id}`,
    });
    expect(res.statusCode).to.equal(200);
  });
    
  it('returns nothing when filtering bad stuff', async () => {
    const res = await server.inject({
        method: 'get',
        url: '/rides?name=foobar',
    });
    expect(res.statusCode).to.equal(200) && expect(res.result).empty();
  });
  
  it('returns something when filtering correct', async () => {
    var res = await server.inject({
      method: 'post',
      url: '/routes',
      payload: {name: "tour", route: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGdweCBjcmVhdG9yPSJTdHJhdmFHUFgiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTpzY2hlbWFMb2NhdGlvbj0iaHR0cDovL3d3dy50b3BvZ3JhZml4LmNvbS9HUFgvMS8xIGh0dHA6Ly93d3cudG9wb2dyYWZpeC5jb20vR1BYLzEvMS9ncHgueHNkIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnRvcG9ncmFmaXguY29tL0dQWC8xLzEiPgogPG1ldGFkYXRhPgogIDxuYW1lPlRvdXIgU29pciBTdWQgPC9uYW1lPgogIDxhdXRob3I+CiAgIDxuYW1lPlBhdWwtQWRyaWVuIENvcmRvbm5pZXI8L25hbWU+CiAgIDxsaW5rIGhyZWY9Imh0dHBzOi8vd3d3LnN0cmF2YS5jb20vYXRobGV0ZXMvMzMwMzM4NzkiLz4KICA8L2F1dGhvcj4KICA8Y29weXJpZ2h0IGF1dGhvcj0iT3BlblN0cmVldE1hcCBjb250cmlidXRvcnMiPgogICA8eWVhcj4yMDIwPC95ZWFyPgogICA8bGljZW5zZT5odHRwczovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHQ8L2xpY2Vuc2U+CiAgPC9jb3B5cmlnaHQ+CiAgPGxpbmsgaHJlZj0iaHR0cHM6Ly93d3cuc3RyYXZhLmNvbS9yb3V0ZXMvMjg1ODc0NDM1MjYwNzE5OTg1NCIvPgogPC9tZXRhZGF0YT4KIDx0cms+CiAgPG5hbWU+VG91ciBTb2lyIFN1ZCA8L25hbWU+CiAgPGxpbmsgaHJlZj0iaHR0cHM6Ly93d3cuc3RyYXZhLmNvbS9yb3V0ZXMvMjg1ODc0NDM1MjYwNzE5OTg1NCIvPgogIDx0eXBlPlJpZGU8L3R5cGU+CiAgPHRya3NlZz4KICAgPHRya3B0IGxhdD0iNDguODI0NDkwMDAwMDAwMDA0IiBsb249IjIuMzE5MTUiPgogICAgPGVsZT43Mi4wODwvZWxlPgogICA8L3Rya3B0PgogIDwvdHJrc2VnPgogPC90cms+CjwvZ3B4Pgo="}
    });
    res = await server.inject({
      method: 'post',
      url: '/rides',
      payload: {name: "Ride du mercredi", date: "2021-11-11", route: `${route_id}`}
    });
    console.log(res.result)
    ride_id = res.result.id;
    res = await server.inject({
      method: 'get',
      url: '/rides?date=2021-11-11',
    });
    expect(res.statusCode).to.equal(200) && expect(res.result).not.empty();
  })
});
