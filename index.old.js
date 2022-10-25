import express from 'express'
import * as dotenv from 'dotenv'
import QueryString from 'qs'
import path from 'path'
import { fileURLToPath } from 'url'
import request from 'request'

dotenv.config()
const app = express()

function login() {
    let authOptions = {
        uri: 'https://accounts.spotify.com/api/token',
        body: {
            'grant_type': 'authorization_code',
            'code': callback.code,
            'redirect_uri': process.env.REDIRECT_URI
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')),
            'Content-Type': 'applictation/x-www-form-urlencoded'
        },
        json: true
    }
    request(authOptions, (error, response, body) => {
        console.log(error, response, body);
        console.log(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
    })
}

app.get('/getToken', (req, res) => {
    request({
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')),
            'Content-Type': 'applictation/x-www-form-urlencoded'
        },
        body: {
            'grant_type': 'authorization_code',
            'code': callback.code,
            'redirect_uri': process.env.REDIRECT_URI
        },
        json: true
    }, (error, response, data) => {
        console.log(error)
        res.send({ data, error, response })
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var callback = {};

app.get('/callback', (req, res) => {
    res.sendFile('/callback.html', {root: __dirname});

    callback.returnedState = req.query.state || null
    
    if (Number(callback.returnedState) !== callback.state) {
        console.log('States do not match! Aborting Login...')
        return;
    }
    else if (callback.returnedState == callback.state) {
        callback.code = req.query.code
        console.log('Matching States found! Continuing with login process...')
        res.redirect('/getToken');
    }
    else console.log('access_denied')
});

app.get('/login', (req, res) => {

    const scope = 'user-read-currently-playing user-read-playback-position';
    const maxInt = 8
    callback.state = (maxInt) => {
        Math.floor(Math.random() * maxInt);
    }

    res.redirect('https://accounts.spotify.com/authorize?' + 
        QueryString.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: callback.state
    }));
});
app.listen(process.env.PORT)
console.log('Webserver started on http://localhost:8888')