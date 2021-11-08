
const env = process.env.NODE_ENV; // 'dev' or 'test'

const dev = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password",
   connection_string: `http://admin:password@localhost:5984` 
 }
};

const local_test = {
 db: {
   host: 'localhost',
   port: 5984,
   username: "admin",
   password: "password",
   connection_string: `http://admin:password@localhost:5984` 
 }
};

const test = {
  db: {
    host: 'localhost',
    port: 5984,
    username: "admin",
    password: "password",
    connection_string: `http://admin:password@localhost:5984` 
  }  
}

const config = {
 dev,
 test,
 local_test
};

module.exports = config[env];