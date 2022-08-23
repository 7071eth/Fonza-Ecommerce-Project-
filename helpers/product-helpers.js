var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
//  const { unsubscribe } = require('../routes/admin')
const { ObjectID } = require('bson')
const { DeactivationsList } = require('twilio/lib/rest/messaging/v1/deactivation')

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
    },

    lookupCategory: ()=>{
        return new Promise (async(resolve,reject)=>{
            let data = await db.get().collection(collections.CATEGORY_COLLECTION).aggregate([{

                $lookup: {
                  from: 'subcategory',
                  localField: '_id',
                  foreignField: 'mainCategory',
                  as: 'bookings'
                }

                
                
              }]).toArray().then((data)=>{
                
                resolve(data)
              });

              resolve(data)
        })
    },

    doAdd: (productData) => {
        return new Promise(async (resolve, reject) => {

            let arr=productData.mainCategory
            for(i=0;i<arr.length;i++){
                arr[i] = ObjectID(arr[i])
            }
            console.log(arr)
            productData.mainCategory=arr
            console.log(productData)
            
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                resolve(data.insertedId)
            })


        })
    },

    viewProduct: ()=>{
        return new Promise(async(resolve,reject)=>{

            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
            })
            
            resolve(products)
            
        })
    },

    viewProductDetails: (prodId)=>{
        console.log(prodId)
        return new Promise(async(resolve,reject)=>{

            let productOne = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectID(prodId)})
            resolve(productOne)
            
            
        })
    },

    deleteProduct: (prodId)=>{
        return new Promise(async (resolve,reject)=>{
            console.log("Success")
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id : ObjectID(prodId)}).then((data)=>{
                console.log("Deleted")
            })
            resolve("Deleted Successfully")
        })
    },

    

    deleteProducts: (prodId)=>{
        return new Promise(async (resolve,reject)=>{
            console.log("Success")
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteMany(
                { mainCategory: ObjectID(prodId) }
             ).then((data)=>{
                console.log(data)
             })
            resolve("Deleted Successfully")
        })
    },

    updateProduct: (prodId,prodDetails)=>{
        return new Promise (async (resolve,reject)=>{
            console.log("Success")
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: ObjectID(prodId)},{
                $set:{

                    title : prodDetails.title,
                    price : prodDetails.price,
                    description : prodDetails.description,
                    image : prodDetails.image
                    
                }
            })
            resolve("Success")
        })
    },

    deleteSubCategory: (prodId)=>{
        return new Promise(async (resolve,reject)=>{
            console.log("Success")
            await db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteOne({_id : ObjectID(prodId)}).then((data)=>{
                console.log("Deleted")
            })
            resolve("Deleted Successfully")
        })
    },

    viewBrands: ()=>{
        return new Promise(async(resolve,reject)=>{

            let Brands = await db.get().collection(collection.SUBCATEGORY_COLLECTION).find({ mainCategory : ObjectID('62eb557670dadb7751c34844')}).toArray()
            
            resolve(Brands)
        })
    },

    viewBrandProducts: ()=>{
        return new Promise (async(resolve,reject)=>{
            let data = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                
                {

                $match: {

                    _id : ObjectID('62eb557670dadb7751c34844')
                  
                }
                 },
                 {

                    $lookup: {
    
                      from: 'subcategory',
                      localField: '_id',
                      foreignField: 'mainCategory',
                      as: 'Datas'
                    }
                     },
                     {
    
                        $unwind: {
        
                          path : "$Datas"
                        }
                         },
                         {
        
                            $lookup: {
            
                              from: 'product',
                              localField: 'Datas._id',
                              foreignField: 'mainCategory',
                              as: 'products'
                            }
                             },
                             {
            
                                $unwind: {
                
                                  path : "$products"
                                }
                                 }



              ]).toArray().then((data)=>{
                
                resolve(data)
              });
        })
    },

    

    


    viewBrand: (id)=>{
        return new Promise(async(resolve,reject)=>{
            id=ObjectID(id)

            db.get().collection(collection.SUBCATEGORY_COLLECTION).aggregate([
                {
                    $match : {_id : id}
                },
                {

                   $lookup: {
   
                     from: 'product',
                     localField: '_id',
                     foreignField: 'mainCategory',
                     as: 'products'
                   }
                    },{
            
                        $unwind: {
        
                          path : "$products"
                        }
                         }
            ]).toArray().then((data)=>{
                console.log(data)
                resolve(data)
            })

            

        })
    },

    

    

    
}

