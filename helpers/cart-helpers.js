var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

const { ObjectID } = require('bson')
const { response } = require('../app')

module.exports = {
    
    addToCart : (data)=>{
        data.user= ObjectID(data.user)
        data.product=ObjectID(data.product)
        
        data.quantity=parseInt(data.quantity)
        console.log("Data")
        console.log(data)
        return new Promise(async (resolve,reject)=>{

           if(await db.get().collection(collection.CART_COLLECTION).findOne({$and : [{user : data.user},{product : data.product}]}))
            {
                await db.get().collection(collection.CART_COLLECTION).updateOne({$and : [{user : data.user},{product : data.product}]},{$inc : {quantity : 1}}).then((response)=>{
                    console.log(response)
                    console.log(" Changed quantity")
                })
           } else {
            await db.get().collection(collection.CART_COLLECTION).insertOne(data).then((response)=>{
                console.log(response)
                console.log("Added new product")
                
            })
           }
           resolve ("Success")

         

           
           
            
        })
    },

    viewCart : (data)=>{

        let _id=ObjectID(data)

        return new Promise(async (resolve,reject)=>{

            console.log("This is the data "+_id)

           let cData = await db.get().collection(collection.CART_COLLECTION).aggregate([{

             $match : { user : _id }
            
        
            },{

            $lookup: {
              from: 'product',
              localField: 'product',
              foreignField: '_id',
              as: 'cartProducts'
            }

            
            
          },
          {

             $unwind: {

               path : "$cartProducts"
             }
              }]).toArray()
        console.log(cData)
        resolve(cData)
           
        })

    }

}
