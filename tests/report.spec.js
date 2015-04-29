'use strict';
var IndiciaMobile = require('../indicia-mobile');

describe("Indicia Mobile: Reports", function() {
  var client;
  beforeEach(function(){
    client = new IndiciaMobile(testConfig.app);
  });
  describe("#report()", function() {
    it("should work", function(done) {
      client.login(testConfig.user.email,testConfig.user.password,function(err,response){
        expect(err).to.not.exist;
        expect(response).to.exist;
        client.report({
          survey_id: testConfig.survey_id
        },function(err,response){
          expect(response).to.be.an('array');
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
