'use strict';
var IndiciaMobile = require('../indicia-mobile');

describe("Indicia Mobile: Authentication", function() {
  var client;
  beforeEach(function(){
    client = new IndiciaMobile(testConfig.app);
  });
  describe("#login()", function() {
    it("should work", function(done) {
      client.login(testConfig.user.email,testConfig.user.password,function(err,response){
        expect(err).to.not.exist;
        expect(response).to.exist;
        done();
      });
    });
  });
});
