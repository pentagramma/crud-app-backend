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

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    next();
})

app.use('/api/v1/',router)
app.all('*',(req,res)=>{
    res.status(404).send({
        message:'please provide valid route'
    })
})

module.exports = app