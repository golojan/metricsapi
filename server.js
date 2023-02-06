const express = require('express')
const server = express();
require("dotenv").config()
const ejs = require('ejs');
const path = require('path')
const { send } = require('express/lib/response');

server.set("view engine","ejs")
server.set("views",path.join(__dirname,"views"))

server.use(express.static(path.join(__dirname,"public")))

server.get("/", (req, res) => {
    res.render('index', {
        title: "HomePage"
    })
})

const DB = require("./module/dbconnect");

const port = process.env.SERVER_PORT || 5000
server.listen(port, () => {
    console.log(`Server up and Running... http://localhost:${port}`)
})