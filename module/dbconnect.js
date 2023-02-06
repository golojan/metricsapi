// setup mongodb with mongoose
const mongoose = require('mongoose')
let DB = {};

// setup mongodb server connections
const dburi = process.env.SVR_DB_URI
const connection = mongoose.connect(dburi, {
    useNewUrlParser: true 
}).then((con) => {
    console.log(`Connected DB`)
}).catch((err) => {
    console.log(`Error:` + err)
});

DB.connection = connection;

module.exports = DB;