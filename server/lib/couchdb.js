
const mockCouch = require('mock-couch').createServer();

exports.start = async (port, db) => {
  mockCouch.listen(port, function() {});
  mockCouch.addDB(db, []);
  console.log(`Mock Couch running on port ${port}`);
  return mockCouch;
};

exports.close = async () => {
  mockCouch.close();
  return mockCouch;
}