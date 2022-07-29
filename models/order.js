const mongoose=require('mongoose')
const connection=require('../config/connection')
const user= require('./user')

const order=new mongoose.Schema({
    total:{
        type: String,
        required:true
    },
    customer_id:{
        type: mongoose.Schema.ObjectId,
        ref: user ,
        required:true,
        index:true
    }
});

const Order=connection.model('Order',order)

module.exports=Order;