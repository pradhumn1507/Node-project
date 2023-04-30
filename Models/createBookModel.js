const mongoose = require('mongoose')
const Schema = mongoose.Schema
const createBookSchema = new Schema({
    bookTitle:{
        type : String,
        required : true
    },
    bookPrice:{
        type : String,
        required : true
    },
    bookAuther:{
        type : String,
        required : true,
    },
    bookCategory:{
        type : String,
        required : true,
    },
})


module.exports = mongoose.model("book", createBookSchema);
