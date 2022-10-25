import { spotify, getNowPlaying } from '../app'
console.log(spotify.access_token, spotify.refresh_token)

setInterval(getNowPlaying, 1000)