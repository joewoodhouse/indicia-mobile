'use strict';

describe("Indicia Mobile: Authentication", function() {
  var client;
  beforeEach(function() {
    client = new IndiciaMobile(testConfig.app);
  });
  describe("#login()", function() {
    it("should work", function(done) {
      client.login(testConfig.user.email, testConfig.user.password)
        .then(function(response) {
          expect(response).to.exist;
          done();
        }, function(err) {
          done(err);
        });
    });
  });
});
