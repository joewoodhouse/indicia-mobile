'use strict';

describe("Indicia Mobile: Sample", function() {
  var client;
  beforeEach(function() {
    client = new IndiciaMobile(testConfig.app);
  });
  describe("Sample", function() {
    describe('Constructor',function(){
      it('should work',function(){

        var sample = new IndiciaMobile.Sample({
          'sample:date': '02/12/2014',
          'sample:entered_sref': '',
          'sample:entered_sref_system': '',
          '282': ''
        });
      });
    });
  });
});
