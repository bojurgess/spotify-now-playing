// Dependencies
import path from 'path'
import { fileURLToPath } from 'url'
import express, { application } from 'express'

// Defining dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialise express library, tell it to use cors and define our mime type for js files as application/javascript
const app = express()
app.use(cors())

express.static.mime.define({'application/javascript': ['js']});

// Add a route for /
app.get('/', (req, res) => {
    res.sendFile('./routes/index.html', {root: __dirname})
})

// Add a route for /NowPlaying
app.get('/NowPlaying', (req, res) => {
    res.sendFile('./routes/nowplaying.html', {root: __dirname})
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