var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

const {
    ObjectID
} = require('bson')
// const { response } = require('../app')

module.exports = {



    addOffer: (data) => {
        
        console.log(data)
        data.percent=parseInt(data.percent)
        data.start= new Date(data.start)
        data.end= new Date(data.end)
        

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.OFFER_COLLECTION).insertOne(data).then((response) => {
                console.log(response)
                resolve(response)

            })

        })

    },

    catOffers : ()=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.SUBCATEGORY_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: 'offer',
                        localField: 'offerId',
                        foreignField: '_id',
                        as: 'Offer'
                    }
                },{

                    $match: {
    
                        mainCategory : ObjectID('62eb557670dadb7751c34844')
                      
                    }
                     },{
    
                        $unwind: {
        
                          path : "$Offer"

                        }
                         }

            ]).toArray().then((response)=>{
                console.log(response+"heldjsl")
                resolve(response)
            })
        })
    },

    addCoffer : (offerId,brndId)=>{
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({_id : ObjectID(brndId)},{$set : {offerId: offerId}},{upsert: true})
            resolve()
        })
    },
    proOffers : ()=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: 'offer',
                        localField: 'offerId',
                        foreignField: '_id',
                        as: 'Offer'
                    }
                },{
    
                        $unwind: {
        
                          path : "$Offer"
                          
                        }
                         },{
                            $match : {offer : true}
                         }

            ]).toArray().then((response)=>{
                console.log(response+"heldjsl")
                resolve(response)
            })
        })
    },

    getOffers : (page,limit)=>{
        return new Promise (async (resolve,reject)=>{
            let offers = await db.get().collection(collection.OFFER_COLLECTION).find().limit(limit * 1).skip((page-1)*limit).toArray()
            resolve(offers)
        })
    },
    getCount : ()=>{
        return new Promise (async (resolve,reject)=>{
            let count =await db.get().collection(collection.OFFER_COLLECTION).countDocuments()
            console.log(count)
            resolve(count)
        })
    },

    removeCategoryOffer: (brand)=>{
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({_id: ObjectID(brand)},{$unset: {offerId: 1}})
            db.get().collection(collection.PRODUCT_COLLECTION).find({mainCategory : ObjectID(brand)  }).toArray().then(async (response)=>{
                console.log(response)
                console.log("check 3")
                for(i=0;i<response.length;i++){
                    let id =response[i]._id
                    newPrice=response[i].ogPrice
                    
                    

                   await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : response[i]._id},{$set : {price : newPrice} }).then(async (response)=>{

                    await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : id},{$unset : {offerId : 1,offer: 1,oldPrice: 1, expire: 1,cent: 1}}).then((response)=>{
                        console.log(response)
                        resolve(response)
                   })
                        
                   })
                }
            })
        })
    },

    removeProductOffer: (product)=>{
        return new Promise (async (resolve,reject)=>{
            
            db.get().collection(collection.PRODUCT_COLLECTION).find({_id : ObjectID(product)}).toArray().then(async (response)=>{
                console.log(response)
                console.log("check 3")
               

                    let id =response[0]._id
                    newPrice=response[0].ogPrice
                    
                   await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : response[0]._id},{$set : {price : newPrice} }).then(async (response)=>{

                    await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : id},{$unset : {offerId : 1,offer: 1,oldPrice: 1, expire: 1,cent: 1}}).then((response)=>{
                        console.log(response)
                        resolve(response)
                   })
                        
                   })
                
            })
        })
    },

    removeOffer: (id)=>{
        return new Promise(async (resolve,reject)=>{
            db.get().collection(collection.OFFER_COLLECTION).deleteOne({_id: ObjectID(id) }).then(async (response)=>{
                await db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({offerId: ObjectID(id)},{$unset: {offerId: 1}})
                db.get().collection(collection.PRODUCT_COLLECTION).find({offerId : ObjectID(id)  }).toArray().then(async (response)=>{
                    console.log(response)
                    console.log("check 3")
                    for(i=0;i<response.length;i++){
                        let id =response[i]._id
                        newPrice=response[i].ogPrice
                        
                       await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : response[i]._id},{$set : {price : newPrice} }).then(async (response)=>{
    
                        await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : id},{$unset : {offerId : 1,offer: 1,oldPrice: 1, expire: 1,cent: 1}}).then((response)=>{
                            console.log(response)
                            
                       })
                            
                       })
                    }
                    resolve(response)
                })
            })
        })
    }

    



}