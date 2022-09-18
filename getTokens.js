const code = require('./code.json');

function getTokens () {
spotifyApi.authorizationCodeGrant(code).then(
  function(data) {
    console.log('Authentication Success! Access Token is ' + data.body['access_token'])
    //Setting the refresh and access tokens.
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
  },
  function(err) {
    console.log('Uh Oh! Unexpected Error Occurred. ' + err);
  }
)
};