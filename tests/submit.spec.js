'use strict';
var IndiciaMobile = require('../indicia-mobile');

describe("Indicia Mobile: Submit Record", function() {
  var client;
  beforeEach(function(done) {
    client = new IndiciaMobile(testConfig.app);
    client.login(testConfig.user.email, testConfig.user.password, done);
  });

  describe("#submit()", function() {
    it.only("should work", function(done) {
      client.submit({
        website_id: 17,
        appname: testConfig.app.appname,
        appsecret: testConfig.app.appsecret,
        survey_id: 23
      }, function(err, body, response) {
        console.log(err,body,response.statusCode);
        done();
      });
    });
  });
});
