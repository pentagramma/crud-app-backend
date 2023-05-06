const express = require('express')
const app = express()
const parser = require('body-parser')
const dotenv = require('dotenv')
const router = require('../routes/index')
const cors = require('cors')
dotenv.config()


app.use(parser.json())
app.use(parser.urlencoded({extended:false}))
app.use(cors())

app.use('/api/v1/',router)

module.exports = app