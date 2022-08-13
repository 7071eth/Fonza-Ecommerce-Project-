var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')


const { ObjectID } = require('bson')
const { response } = require('../app')

// const { response } = require('../app')

module.exports = {

    
    
   placeOrder: (data)=>{

    

    return new Promise(async (resolve,reject)=>{
        console.log(data)
       await  db.get().collection(collection.ORDER_COLLECTION).insertOne(data).then((response)=>{
          
            resolve(response)
        })
        
    })
    
    
   },

   getOrders : (id)=>{

    console.log(id)
    
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).find({user: id}).toArray().then((response)=>{
            resolve(response)
        })
        
    })
    
   },
   
   updateStatus : (id)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : id},{$set : {status : "cancelled"}}).then((response)=>{
            console.log(response)
            resolve(response)
        })
    })
   },

   getAllOrders : ()=>{

    
    
    return new Promise(async(resolve,reject)=>{

        await db.get().collection(collection.ORDER_COLLECTION).find().toArray().then((response)=>{
            resolve(response)
        })
        
    })
    
   },

   changeStatus : (data)=>{

    id=ObjectID(data.invoice)
    newStatus =data.status

    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id : id},{$set : {status : newStatus}}).then((response)=>{
            console.log(response)
            resolve(response)
        })
    })
   },

   getinvoice : (invoice)=>{
    console.log(invoice);
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).findOne({_id : ObjectID(invoice) }).then((response)=>{
            console.log(response)
            resolve(response)
        })
    })
   }



}
