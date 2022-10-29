// Dependencies
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
import { state, spotify, parseNowPlaying, playback, player } from './app.js';
import request from 'request';
import QueryString from 'qs';

import express, { application } from 'express';

// Defining dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialise express library, tell it to use cors and define our mime type for js files as application/javascript
const router = express.Router()

express.static.mime.define({'application/javascript': ['js']});

// Route for /
router.get('/', (req, res) => {
    res.sendFile('./routes/index.html', {root: __dirname})
})

// Route for /NowPlaying
router.get('/NowPlaying', (req, res) => {
    res.sendFile('./routes/nowplaying.html', {root: __dirname})
})

// Route for app.js
router.get('/app.js', (req, res) => {
    res.sendFile('./app.js', {root: __dirname})
})

// Login route, passes basic information to Spotify Accounts Service.
router.get('/login', (req, res) => {

    //Random Number Generator
    state.initial = Math.floor(Math.random() * 16)
    const scope = 'user-read-currently-playing';

    res.redirect('https://accounts.spotify.com/authorize?' + 
        QueryString.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: state.initial,
            show_dialog: true
    }));
})
//Callback route post initial authentication stage with Spotify Accounts Service
router.get('/callback', (req, res) => {
    
    // Parses the state passed to us in the callback url as a number, if a state is not provided it is defined as null
    state.callback = Number(req.query.state) || null

    const code = req.query.code || null

    // If callback state is null or does not match initial state, redirect to /# and provide ?error=state_mismatch
    if (state.callback === null || state.callback !== state.initial) {
        res.redirect('/#' + 
        QueryString.stringify({
            error: 'state_mismatch'
        }));
        console.log('State mismatch detected! Aborting authentication...')
    }
    // If callback state matches the initial state, send a success.html file and proceed with auth process.
    else if (state.callback === state.initial) {
        res.redirect('/NowPlaying');
        console.log('Matching states found! Proceeding with auth process.')

        // Defining what is sent to the accounts service in the post request
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')),
                'Content-Type': 'applictation/x-www-form-urlencoded'
            },
            json: true
        };

        // Making post request to Spotify Accounts Service
        request.post(authOptions, (error, response, body) => {
            //If the expected 200 response code is returned, define the access & refresh tokens.
            if (!error && response.statusCode === 200) {

                spotify.access_token = body.access_token;
                spotify.refresh_token = body.refresh_token;

                //Defining options to be sent in another get request.
                const options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + spotify.access_token },
                    json: true
                };

                //Make get request to access the Spotify Web API, using previously acquired access token.
                request.get(options, (error, response, body) => {
                    setInterval(() => {
                        parseNowPlaying();
                        playback()
                    }, 1000)
                });
            // If an unexpected response code is returned in the post request, redirect to /# and pass querystring 'invalid_token'.
            } else {
                res.redirect('/#' + 
                    QueryString.stringify({
                        error: 'invalid_token'
                }));
            }
        });
    }
});

export default router