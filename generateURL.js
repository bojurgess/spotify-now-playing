const { clientId, clientSecret, redirectUri } = require('./credentials.json');
const http = require('http');
const url= require('url');
const SpotifyWebApi = require('spotify-web-api-node');
const open = require('open');
const fs = require('fs');
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri
});

const scopes = ['user-read-currently-playing', 'user-read-playback-state'],
  state = 'foobar';
  
http 
  .createServer(function(req, res) {
    let queryObject = url.parse(req.url, true).query;
    let code = JSON.stringify(queryObject.code);
    fs.writeFileSync('code.json', code, function(err) {
    })
      
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1 style="color: green">Authentication Successful!</h1>')
    res.end();
  })
  .listen(8888);

let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
open(authorizeURL);
