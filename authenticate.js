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
    if (err) {
      console.log('Error:' + err);
    }
    else {
      console.log('Authentication Success! Access Token is ' + data.body['access_token'])
    }
    //Setting the refresh and access tokens.
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
  }
);
