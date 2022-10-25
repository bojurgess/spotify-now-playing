import express from 'express'
import * as dotenv from 'dotenv'
import QueryString from 'qs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
const state = {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/login', (req, res) => {

    state.initial = Math.floor(Math.random() * 16)
    const scope = 'user-read-currently-playing';

    res.redirect('https://accounts.spotify.com/authorize?' + 
        QueryString.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: state,
            show_dialog: true
    }));
})

app.get('/callback', (req, res) => {
    
    state.callback = req.query.state || null

    if (state.callback === state.initial) {
        res.sendFile('/success.html', {root: __dirname});
    }
    else if (state.callback !== state.initial) {
        res.sendFile('/fail.html', {root: __dirname});
    }
})

app.listen(process.env.PORT)
console.log('Webserver Started on http://localhost:8888')

console.log(state.initial, state.callback)