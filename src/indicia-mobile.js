/*!
 * @overview Indicia Mobile
 *
 * @copyright
 *
 * @license Licensed under MIT license
 */
(function() {
  'use strict';

  function extend(dst,obj){
    for(var i in obj){
      if(obj.hasOwnProperty(i)){
        dst[i] = obj[i];
      }
    }
    return dst;
  }

  var IndiciaMobile = function(options) {
    this.base_url = options.base_url;
    this.appname = options.appname;
    this.appsecret = options.appsecret;
    this.website_id = options.website_id;
    this.survey_id = options.survey_id;

    this.credentials = {
      usersecret: options.usersecret || null,
      email: options.email || null
    };
  };

  function parseLoginResponse(str) {
    // The mobile auth login echos 3 lines back at us:
    // usersecret
    // firstname
    // lastname
    var lines = str.split(/\r\n|\r|\n/g);
    return {
      usersecret: lines[0],
      firstname: lines[1],
      lastname: lines[2]
    };
  }


  IndiciaMobile.prototype._request = function(path, data, uploads) {

    var url = path.indexOf('//') >= 0 ? path : this.base_url + path;
    url = url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    var form = new FormData();

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        form.append(i, data[i]);
      }
    }
    form.append('appname', this.appname);
    form.append('appsecret', this.appsecret);

    if(uploads){
      for(var j = 0; j < uploads.length; j++){
        var upload = uploads[j];
        form.append(upload.name,upload.data,upload.filename);
      }
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 300) {
            resolve({
              body: this.responseText,
              response: this
            });
          } else {
            reject(this.status);
          }
        }
      };
      xhr.send(form);
    });
  };

  IndiciaMobile.prototype.login = function(email, password) {
    var self = this;
    return this._request('/user/mobile/register', {
        email: email,
        password: password
      })
      .then(function(response) {
        response = parseLoginResponse(response.body);
        // Store the details
        self.credentials = {
          email: email,
          usersecret: response.usersecret
        };
        return self.credentials;
      });
  };

  /**
   * logout
   * Does not send anything to the server just resets our credentials
   */
  IndiciaMobile.prototype.logout = function() {
    this.credentials = {
      usersecret: null,
      email: null
    };
  };

  /**
   * isLoggedIn
   * @return {Boolean} Whether we are logged in or not
   */
  IndiciaMobile.prototype.isLoggedIn = function() {
    return !!this.credentials.usersecret;
  };

  /**
   * register Register a user account
   * @param  {Object}   options All fields required
   * @param  {String}   options.email Email Address
   * @param  {String}   options.firstname First Name
   * @param  {String}   options.lastname Last Name
   * @param  {String}   options.password Password
   * @param  {Function} cb      Callback
   */
  IndiciaMobile.prototype.register = function(options) {
    var self = this;
    this._request('/user/mobile/register', options)
      .then(function(response) {
        response = parseLoginResponse(response.body);
        // Store the details
        self.credentials = {
          email: options.email,
          usersecret: response.usersecret
        };
        return self.credentials;
      });
  };

  /**
   * report
   */
  IndiciaMobile.prototype.report = function(options) {
    options = options || {};

    if (!this.isLoggedIn()) {
      return Promise.reject(Error("Must be logged in"));
    }

    return this._request('/mobile/report', {
        email: this.credentials.email,
        usersecret: this.credentials.usersecret,
        report: options.report || 'library/totals/user_survey_contribution_summary.xml',
        survey_id: options.survey_id || this.survey_id
      })
      .then(function(response) {
        return JSON.parse(response.body);
      });
  };

  /**
   * Submit
   */
  IndiciaMobile.prototype.submit = function(sample,options) {

    options = extend({
      authenticated: true,
    },options || {});

    // Start with the basic system level params
    var submission = {
      appname: this.appname,
      appsecret: this.appsecret,
      website_id: this.website_id,
      survey_id: this.survey_id
    };

    if (!this.isLoggedIn()) {
      return Promise.reject(Error("Must be logged in"));
    }

    if(options.authenticated){
      submission.email = this.credentials.email;
      submission.usersecret = this.credentials.usersecret;
    }

    extend(submission,sample.encode());

    return this._request('/mobile/submit', submission, sample.uploads)
      .then(function(response) {
        return response.body;
      }).
    catch(function(err) {
      switch (err) {
        case 400:
          err = 'An Unexpected Error Occured';
          break;
      }

      throw Error(err);
    });
  };

  /**
   * Sample
   */
  IndiciaMobile.Sample = function(options) {
    this.fields = extend({
      entered_sref: null,
      entered_sref_system: null,
      date: null,
      comment: null
    },options || {});

    this.occurrences = [];
    this.uploads = [];
  };

  IndiciaMobile.Sample.prototype.set = function(key,value){
    this.fields[key] = value;
    return this;
  };

  IndiciaMobile.Sample.prototype.encode = function() {
    var result = {};

    for(var f in this.fields){
      if(this.fields.hasOwnProperty(f)){
        result['sample:'+f] = this.fields[f];
      }
    }

    for (var i = 0; i < this.occurrences.length; i++) {
      extend(result,this.occurrences[i].encode(i+1));
    }

    return result;
  };

  IndiciaMobile.Sample.prototype.addOccurrence = function(options){
    var occ = new IndiciaMobile.Occurrence(options);
    this.occurrences.push(occ);
    return occ;
  };

  /**
   * Occurrence
   */
  IndiciaMobile.Occurrence = function(options) {
    this.fields = extend({
      taxa_taxon_list_id: null
    },options || {});
  };

  IndiciaMobile.Occurrence.prototype.set = function(key,value){
    this.fields[key] = value;
    return this;
  };

  IndiciaMobile.Occurrence.prototype.encode = function(idx){
    var result = {};
    for(var f in this.fields){
      if(this.fields.hasOwnProperty(f)){
        result['sc:'+idx+'::'+f] = this.fields[f];
      }
    }
    return result;
  };

  window.IndiciaMobile = IndiciaMobile;

}).call(this);
