/*!
 * @overview Indicia Mobile
 *
 * @copyright
 *
 * @license Licensed under MIT license
 */
(function() {
  'use strict';

  var XMLHttpRequest;

  if (typeof exports !== 'undefined') {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  }

  if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
    XMLHttpRequest = window.XMLHttpRequest;
  }

  var IndiciaMobile = function(options) {
    this.baseUrl = options.baseUrl;
    this.appname = options.appname;
    this.appsecret = options.appsecret;
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
  IndiciaMobile.prototype._request = function(method, path, data, cb) {

    function transformData(data) {
      var str = [];
      for (var p in data) {
        if (data.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
        }
      }
      return str.join('&');
    }

    var url = path.indexOf('//') >= 0 ? path : this.baseUrl + path;
    url = url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    var xhr = new XMLHttpRequest();

    xhr.open(method, url);

    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 300) {
          cb(null, this.responseText, this);
        } else {
          cb(this.status);
        }
      }
    };

    if (data) {
      if (this.appname) {
        data.appname = this.appname;
        data.appsecret = this.appsecret;
      }
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(transformData(data));
    }

  };

  IndiciaMobile.prototype.login = function(email, password, cb) {
    var self = this;
    this._request('POST', '/user/mobile/register', {
      email: email,
      password: password
    }, function(err, response) {
      if (err) {
        return cb(err);
      } else {
        response = parseLoginResponse(response);
        // Store the details
        self.credentials = {
          email: email,
          usersecret: response.usersecret
        };

        return cb(null, response);
      }
    });
  };

  /**
   * logout
   * Does not send anything to the server just resets our credentials
   */
  IndiciaMobile.prototype.logout = function() {
    this.credentials = null;
  };

  /**
   * isLoggedIn
   * @return {Boolean} Whether we are logged in or not
   */
  IndiciaMobile.prototype.isLoggedIn = function() {
    return !!this.credentials;
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
  IndiciaMobile.prototype.register = function(options,cb) {
    var self = this;
    this._request('POST', '/user/mobile/register', options, function(err, response) {
      if (err) {
        cb(err);
      } else {
        response = parseLoginResponse(response);
        // Store the details
        self.credentials = {
          email: options.email,
          usersecret: response.usersecret
        };
        cb(null,response);
      }
    });
  };

  /**
   * report
   */
  IndiciaMobile.prototype.report = function(options,cb){
    options = options || {};

    this._request('POST','/mobile/report',{
      email: this.credentials.email,
      usersecret: this.credentials.usersecret,
      report: options.report || 'library/totals/user_survey_contribution_summary.xml',
      survey_id: options.survey_id
    },function(err,response){
      if(err){
        return cb(err);
      }else{
        return cb(null,JSON.parse(response));
      }
    });
  };


  if (typeof exports !== 'undefined') {
    module.exports = IndiciaMobile;
  } else {
    window.IndiciaMobile = IndiciaMobile;
  }

}).call(this);
