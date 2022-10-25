// Dependencies
import express, { application } from 'express'
import * as dotenv from 'dotenv'
import QueryString from 'qs'
import path from 'path'
import { fileURLToPath } from 'url'
import request from 'request';
import cors from 'cors';
import * as fs from 'fs'

// Initialise dotenv & express
dotenv.config()
const app = express()
app.use(cors())
// Initialise empty 'state' object for later use
const state = {}
const spotify = {}

// Defining dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile('/index.html', {root: __dirname})
})

app.get('/NowPlaying', (req, res) => {
    res.sendFile('/nowplaying.html', {root: __dirname})
})

app.get('/style.css', (req, res) => {
    res.sendFile('/style.css', {root: __dirname})
})

app.get('/require.js', (req, res) => {
    res.sendFile('/require.js', {root: __dirname})
})

app.get('/response.json', (req, res) => {
    res.sendFile('/response.json', {root: __dirname})
})

// Login route, passes basic information to Spotify Accounts Service.
app.get('/login', (req, res) => {

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
app.get('/callback', (req, res) => {
    
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
        res.sendFile('/success.html', {root: __dirname});
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
                    setInterval(getNowPlaying, 1000)
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

// Request a new access token using our refresh token.
app.get('/refresh_token', (req, res) => {
    const refresh_token = spotify.refresh_token;
    // Defining authOptions to be passed to our post request. Same as before except we discard the need for a code value and use the grant type 'refresh_token' instead.
    // We also discard the 'content_type' header in our new request.
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        headers: { 'Authorization': 'Basic ' + (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')), },
        json: true
    };

    // Make our post request to the accounts service, providing our authOptions to generate a new access token.
    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            spotify.access_token = body.access_token;
            res.send({
                'access_token': spotify.access_token
            });
        }
    });
});

function getNowPlaying() {
    
    const requestOptions = {
        url: 'http://api.spotify.com/v1/me/player/currently-playing',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + spotify.access_token
        }
    };

    request.get(requestOptions, (error, response, body) => {
        const rawData = JSON.parse(body)
        const data = {
            songName: rawData.item.name,
            songUri: rawData.item.uri,
            songId: rawData.item.id,
            artist: rawData.item.artists[0].name,
            artistUri: rawData.item.artists[0].uri,
            albumArt: rawData.item.album.images[1].url,
            progress_ms: rawData.progress_ms,
            duration_ms: rawData.item.duration_ms
        }

        function playback() {
            let progress_seconds = Math.floor(data.progress_ms / 1000)
            let progress_minutes = Math.floor(data.progress_ms / 60000)
    
            let duration_seconds = Math.floor(data.duration_ms / 1000)
            let duration_minutes = Math.floor(data.duration_ms / 60000)
    
                progress_seconds = progress_seconds % 60;
                progress_minutes = progress_minutes % 60;
    
                duration_seconds = duration_seconds % 60;
                duration_minutes = duration_minutes % 60;
                
                progress_seconds = progress_seconds.toString().padStart(2, '0')
                duration_seconds = duration_seconds.toString().padStart(2, '0')

            console.log(`${progress_minutes}:${progress_seconds} / ${duration_minutes}:${duration_seconds}`)
        }
        playback()
        })
}
//Tells express app to listen on port defined in .env then logs the address to the console.
app.listen(process.env.PORT)
console.log(`Webserver Started on http://localhost:${process.env.PORT}`)
console.log(`Visit http://localhost:${process.env.PORT}/login to begin the login process`)