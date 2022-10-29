// Dependencies
import express, { application } from 'express';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'request';
import cors from 'cors';

import router from './router.js';

// Initialise dotenv & express
dotenv.config()
const app = express()
app.use(cors())

express.static.mime.define({'application/javascript': ['js']});
// Initialise empty objects for later use
export const state = {}
export const spotify = {}
export const player = {}
export let data = {}

// Defining dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our router from routes.js
app.use(router)
app.use(express.static('public'))

// Request a new access token using our refresh token.
function refresh_token() {
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
};

// Get the now playing song
export function parseNowPlaying() {
    
    // Options for our GET request
    const requestOptions = {
        url: 'http://api.spotify.com/v1/me/player/currently-playing',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + spotify.access_token
        }
    };

    request.get(requestOptions, (error, response, body) => {
        // console.log(body)
        // Creating an object out of raw json data recieved from http response
            const rawData = JSON.parse(body)
            data = {
                songName: rawData.item.name,
                songUri: rawData.item.uri,
                songId: rawData.item.id,
                artist: rawData.item.artists[0].name,
                artistUri: rawData.item.artists[0].uri,
                albumArt: rawData.item.album.images[1].url,
                progress_ms: rawData.progress_ms,
                duration_ms: rawData.item.duration_ms
            }

    });
}
        
// Turns ms values for duration and playback into a more readable format (mm:ss)
export function playback() {
    player.progress.seconds = Math.floor(data.progress_ms / 1000)
    player.progress.minutes = Math.floor(data.progress_ms / 60000)

    player.duration.seconds = Math.floor(data.duration_ms / 1000)
    player.duration.minutes = Math.floor(data.duration_ms / 60000)

    player.progress.seconds = player.progress.seconds % 60;
    player.progress.minutes = player.progress.minutes % 60;
    
    player.duration.seconds = player.duration.seconds % 60;
    player.duration.minutes = player.duration.minutes % 60;
                
    player.progress.seconds = player.progress.seconds.toString().padStart(2, '0')
    player.duration.seconds = player.duration.seconds.toString().padStart(2, '0')

    return(`${progress_minutes}:${progress_seconds} / ${duration_minutes}:${duration_seconds}`)
}

console.log(playback() + ` | ${data.songName} by ${data.artist}`)
// Set the refresh_token function to run every hour, when our access token expires.
setInterval(refresh_token, 1000 * 3600)

// Tells express app to listen on port defined in .env then logs the address to the console.
app.listen(process.env.PORT)
console.log(`Webserver Started on http://localhost:${process.env.PORT}`)