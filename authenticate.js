const code = require('./code.json');
const SpotifyWebApi = require('spotify-web-api-node');
const { clientId, clientSecret, redirectUri } = require('./credentials.json');

//Initialise Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

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
);

function refreshAccessToken() {
  spotifyApi.refreshAccessToken().then (
    function(data) {
      console.log('Successfully Refreshed Access Token!');
    }
  ),
    function(err) {
      console.log('Uh Oh! Unexpected Error Occured. ' + err);
    }
};
