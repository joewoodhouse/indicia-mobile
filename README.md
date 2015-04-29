# Indicia Mobile

A client library for the Indicia Mobile Authentication module, targetted for
browsers and Node.js

## Installation

## Usage

Create an IndiciaMobile client, and login

```js
var client = new IndiciaMobile({
  appname: 'YOUR_APPNAME',
  appsecret: 'YOUR_APPSECRET'
});

client.login({
  email: 'YOUR_EMAIL',
  password: 'YOUR_PASSWORD'
})
.then(function(user){

})
.catch(err){

}

```
## Testing

Currently the tests run against a live instance of Indicia - unit tests will follow shortly. To run the tests you must create a configuration file `tests/config.json` with the following format:
```json
{
  "app": {
    "appname": "your_app_name",
    "appsecret": "your_app_secret",
    "baseUrl": "your_indicia_instance_base_url"
  },
  "user": {
    "email": "your_username",
    "password": "your_password"
  },
  "survey_id": "your_survey_id",
  "website_id": "your_website_id"
}

```

## Documentation

None here currently, but the Indicia Mobile Auth module docs can be found [here](https://github.com/Indicia-Team/indicia-docs/tree/master/site-building/iform/modules/mobile-auth)

## Contributing
