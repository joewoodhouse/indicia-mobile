/*!
 * @overview Indicia Mobile
 *
 * @copyright
 *
 * @license Licensed under MIT license
 */
(function() {
  'use strict';

  function extend(dst, obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
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
    this.useRegistrationEndpoint = false;

    if (options.hasOwnProperty('useRegistrationEndpoint')) {
      this.useRegistrationEndpoint = options.useRegistrationEndpoint;
    }

    this.credentials = {
      usersecret: options.usersecret || null,
      email: options.email || null
    };
  };

  IndiciaMobile.prototype.on =
    IndiciaMobile.prototype.addEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
      .push(fn);
      return this;
    };

  IndiciaMobile.prototype.off =
    IndiciaMobile.prototype.removeListener =
    IndiciaMobile.prototype.removeAllListeners =
    IndiciaMobile.prototype.removeEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};

      // all
      if (0 === arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 === arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

  IndiciaMobile.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1),
      callbacks = this._callbacks['$' + event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
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

    var url = path.indexOf('//') >= 0 ? path : this.base_url + path;
    url = url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();

    var form = new FormData();

    for (var i in data) {
      if (data.hasOwnProperty(i)) {

        // If it is an object, assume it is an upload
        if (typeof data[i] === 'object' && data[i] !== null) {
          form.append(i, data[i].data, data[i].filename);
        } else {
          form.append(i, data[i]);
        }
      }
    }
    form.append('appname', this.appname);
    form.append('appsecret', this.appsecret);

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
    var path = this.useRegistrationEndpoint ? '/user/mobile/register' : '/user/mobile/login';
    return this._request(path, {
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
        self.emit('login',self.credentials);
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
    this.emit('logout');
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
   * @param  {String}   options.secondname Last Name
   * @param  {String}   options.password Password
   * @param  {Function} cb      Callback
   */
  IndiciaMobile.prototype.register = function(options) {
    var self = this;
    var path = this.useRegistrationEndpoint ? '/user/mobile/register' : '/user/mobile/signup';

    return this._request(path, options)
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
  IndiciaMobile.prototype.submit = function(sample, options) {

    options = extend({
      authenticated: true,
    }, options || {});

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

    if (options.authenticated) {
      submission.email = this.credentials.email;
      submission.usersecret = this.credentials.usersecret;
    }

    extend(submission, sample.encode());

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
    }, options || {});
    this.occurrences = [];
  };

  IndiciaMobile.Sample.prototype.set = function(key, value) {
    this.fields[key] = value;
    return this;
  };

  IndiciaMobile.Sample.prototype.encode = function() {
    var result = {};

    for (var f in this.fields) {
      if (this.fields.hasOwnProperty(f)) {
        result['sample:' + f] = this.fields[f];
      }
    }

    for (var i = 0; i < this.occurrences.length; i++) {
      extend(result, this.occurrences[i].encode(i + 1));
    }

    return result;
  };

  IndiciaMobile.Sample.prototype.addOccurrence = function(options) {
    var occ = new IndiciaMobile.Occurrence(options);
    this.occurrences.push(occ);
    return occ;
  };

  /**
   * Occurrence
   */
  IndiciaMobile.Occurrence = function(options) {
    this.fields = extend({}, options || {});
  };

  IndiciaMobile.Occurrence.prototype.set = function(key, value) {
    this.fields[key] = value;
    return this;
  };

  IndiciaMobile.Occurrence.prototype.encode = function(idx) {
    var result = {};
    for (var f in this.fields) {
      if (this.fields.hasOwnProperty(f)) {
        result['sc:' + idx + '::' + f] = this.fields[f];
      }
    }
    return result;
  };

  window.IndiciaMobile = IndiciaMobile;

}).call(this);
