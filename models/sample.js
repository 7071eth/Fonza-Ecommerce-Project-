const User=require("./user")
const Order=require('./order')

User.insertMany([{
    name: 'JOHN',
    email: 'john@gmail.com' ,
    password: 'sdkfjadsklf'
},
{
    name: 'Wick',
    email: 'joshy@gmail.com' ,
    password: 'sdkfjadsklf'
},
{
    name: 'Abraham',
    email: 'Linal@gmail.com' ,
    password: 'sdkfjadsklf'
}]).then(customers=>{
    console.log("Users added : ",customers)
}).catch(e=>{
    throw e;
})