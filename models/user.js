const mongoose=require('mongoose')
const connection=require('../config/connection')
 const Schema=mongoose.Schema;

const userSchema= new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required:true
    },
    cart:{
        items:[{
            productId:{
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Product',//objectid will be from the product collections
                required: true
            },
            quantity:{
                type: Number,
                required: true
            }
        }],
        totalPrice: Number
    }
})
//"User" => users
const user =connection.model('User',userSchema)

module.exports= user;