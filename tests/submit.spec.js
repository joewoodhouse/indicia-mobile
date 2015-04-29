'use strict';
var IndiciaMobile = require('../indicia-mobile');

describe("Indicia Mobile: Submit Record", function() {
  var client;
  beforeEach(function(done) {
    client = new IndiciaMobile(testConfig.app);
    client.login(testConfig.user.email, testConfig.user.password, done);
  });

  describe("#submit()", function() {
    it("should work", function(done) {
      client.submit({
        website_id: testConfig.website_id,
        appname: testConfig.app.appname,
        appsecret: testConfig.app.appsecret,
        survey_id: testConfig.survey_id
      }, function(err, body, response) {
        expect(err).to.not.exist;
        expect(body).to.exist;
        expect(response).to.exist;
        done();
      });
    });
  });
});
