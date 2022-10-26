// Dependencies
import express, { application } from 'express'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors';

import router from './router.js';

import { spotify, getNowPlaying } from '../../app.js'
console.log(spotify.access_token, spotify.refresh_token)

setInterval(getNowPlaying, 1000)