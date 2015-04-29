/*!
 * @overview Indicia Mobile
 *
 * @copyright
 *
 * @license Licensed under MIT license
 */
(function() {
  'use strict';

  var XMLHttpRequest, FormData;

  require('es6-promise').polyfill();

  if (typeof window !== 'undefined') {
    XMLHttpRequest = window.XMLHttpRequest;
    FormData = window.FormData;
  } else {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    FormData = require('form-data');
  }


  var IndiciaMobile = function(options) {
    this.baseUrl = options.baseUrl;
    this.appname = options.appname;
    this.appsecret = options.appsecret;
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


  IndiciaMobile.prototype._request = function(path, data) {

    var url = path.indexOf('//') >= 0 ? path : this.baseUrl + path;
    url = url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    var form = new FormData();

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        form.append(i, data[i]);
      }
    }
    form.append('appname', this.appname);
    form.append('appsecret', this.appsecret);

    if (typeof window === 'undefined') {
      return new Promise(function(resolve, reject) {

        form.submit(url, function(err, response) {
          if (err) {
            return reject(Error(err));
          }

          var body = '';
          response.on('data', function(chunk) {
            body += chunk;
          });
          response.on('end', function() {
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve({
                body: body,
                response: response
              });
            } else {
              reject(Error(body));
            }
          });
        });
      });
    } else {

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
    }
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
        survey_id: options.survey_id
      })
      .then(function(response) {
        return JSON.parse(response.body);
      });
  };

  /**
   * Submit
   */
  IndiciaMobile.prototype.submit = function(options) {

    if (!this.isLoggedIn()) {
      return Promise.reject(Error("Must be logged in"));
    }

    return this._request('/mobile/submit', options)
      .then(function(response) {
        return response.body;
      });
  };


  if (typeof exports !== 'undefined') {
    module.exports = IndiciaMobile;
  } else {
    window.IndiciaMobile = IndiciaMobile;
  }

}).call(this);
