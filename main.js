const { clientId, clientSecret, redirectUri } = require('./credentials.json');
const code = require('./code.json');
const scopes = ['user-read-currently-playing', 'user-read-playback-state'],
  state = 'foobar';

const SpotifyWebApi = require('spotify-web-api-node');
const http = require('http');

const url= require('url');
const open = require('open');
const fs = require('fs');

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

let nowPlaying = {};

function generateURL() { 
  http 
    .createServer(function(req, res) {
      let queryObject = url.parse(req.url, true).query;
      fs.writeFile('code.json', JSON.stringify(queryObject.code), function(err) {
      })
        
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<h1 style="color: green">Authentication Successful!</h1>')
      res.end();
    })
    .listen(8888);
  
  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  open(authorizeURL);
};
  
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

function refreshTokens() {
  spotifyApi.refreshAccessToken().then (
    function(data) {
      console.log('Successfully Refreshed Access Token!');
      spotifyApi.setAccessToken(data.body['access_token']);
    }
  ),
    function(err) {
      console.log('Uh Oh! Unexpected Error Occured. ' + err);
    }
};

function getNowPlaying() {
  spotifyApi.getMyCurrentPlaybackState().then(
    function(data) {
      if (data.body && data.body.is_playing) {
        console.log('I am currently listening to: ' + data.body.item.name, 'by ' + data.body.item.artists[0].name);
        nowPlaying.songName = data.body.item.name;
        nowPlaying.artistName = data.body.item.artists[0].name;
      }
      else {
        console.log('I am not currently listening to anything.');
        nowPlaying.songName = 'I am not currently listening to anything.';
      }
    },
    function(err) {
      console.log('Error:' + err);
    }
  )
};

generateURL()
getTokens()
setInterval(refreshTokens, 1000 * 60 * 60)
setInterval(getNowPlaying, 1000 * 5)