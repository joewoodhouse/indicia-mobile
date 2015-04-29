'use strict';
var IndiciaMobile = require('../indicia-mobile');

describe("Indicia Mobile: Reports", function() {
  var client;
  beforeEach(function(done) {
    client = new IndiciaMobile(testConfig.app);
    client.login(testConfig.user.email, testConfig.user.password)
      .then(function() {
        done();
      })
      .catch(done);
  });

  describe("#report()", function() {
    it("should work", function(done) {
      client.report({
        survey_id: testConfig.survey_id
      })
      .then(function(response){
        expect(response).to.be.an('array');
        done();
      })
      .catch(done);
    });
  });
});
