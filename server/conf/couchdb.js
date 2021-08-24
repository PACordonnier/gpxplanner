
const env = process.env.NODE_ENV; // 'dev' or 'test'

const dev = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password"
 }
};

const test = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password"
 }
};

const travis_ci = {
  db: {
    host: 'localhost',
    port: 5984,
    username: "admin",
    password: "travis"
  }
 
}

const config = {
 dev,
 test,
 travis_ci
};

module.exports = config[env];