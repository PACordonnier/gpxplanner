
const env = process.env.NODE_ENV; // 'dev' or 'test'

const dev = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password",
   connection_string: `http://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}` 
 }
};

const test = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password",
   connection_string: `http://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}` 
 }
};

const travis_ci = {
  db: {
    host: 'localhost',
    port: 5984,
    username: "admin",
    password: "travis",
    connection_string: `http://${config.db.host}:${config.db.port}` 
  }
 
}

const config = {
 dev,
 test,
 travis_ci
};

module.exports = config[env];