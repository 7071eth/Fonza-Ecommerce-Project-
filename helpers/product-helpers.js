var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
 const { unsubscribe } = require('../routes/admin')
const { ObjectID } = require('bson')

module.exports={
    addCategory : (mainCategory)=>{

        
        return new Promise(async (resolve,reject)=>{

             await db.get().collection(collections.CATEGORY_COLLECTION).insertOne(mainCategory).then((data) => {
                console.log(data)
                console.log("Success")
                resolve(data.insertedId)
            })
            resolve("Success")

        })

    },

    addSubCategory: (subcategory)=>{

        return new Promise(async(resolve,reject)=>{
            
            await db.get().collection(collections.SUBCATEGORY_COLLECTION).insertOne(subcategory).then((data)=>{
                console.log(data)
                console.log("Success")
                resolve(data.insertedId)
            })
            resolve("Success")
        })
    },
    
    viewCategory:()=>{
        return new Promise(async(resolve,reject)=>{

            

            let data = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
                
            })


            resolve(data)
        })
    }

    
}