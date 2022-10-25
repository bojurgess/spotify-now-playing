//Dependencies
import express from 'express'
import * as dotenv from 'dotenv'
import QueryString from 'qs'
import path from 'path'
import { fileURLToPath } from 'url'

//Initialise dotenv & express
dotenv.config()
const app = express()
//Initialise empty 'state' object for later use
const state = {}

//Defining dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Login route, passes basic information to Spotify Accounts Service.
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
    
    //Parses the state passed to us in the callback url as a number, if a state is not provided it is defined as null
    state.callback = Number(req.query.state) || null

    //If callback state is null, redirect to /# and provide ?error=state_mismatch
    if (state.callback === null) {
        res.redirect('/#' + 
        QueryString.stringify({
            error: 'state_mismatch'
        }));
    }
    //If callback state matches the initial state, send a success.html file and proceed with auth process.
    else if (state.callback === state.initial) {
        res.send('/success.html', {root: __dirname});
    }
    //If callback state does not match the initial state, redirect to /# and provide querystring ?error=state_mismatch
    else if (state.callback !== state.initial) {
        res.redirect('/#' +
        QueryString.stringify({
            error: 'state_mismatch'
        }));
    }
});

//Tells express app to listen on port defined in .env then logs the address to the console.
app.listen(process.env.PORT)
console.log('Webserver Started on http://localhost:' + process.env.PORT)