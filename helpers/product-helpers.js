var db = require('../config/connection')
var collection = require('../config/collections')
const collections = require('../config/collections')

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
            productData.ogPrice=productData.price

            
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

          let productOne =   await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{

                $match : {
                    _id : ObjectID(prodId)
                }
            },{
                $lookup: {
                    from: 'subcategory',
                    localField: 'mainCategory',
                    foreignField: '_id',
                    as: 'category'
                  }
            },{
                $unwind : "$category"
            },
            {
              $lookup: {
                from: "category",
                localField: "category.mainCategory",
                foreignField: "_id",
                as: "category.user"
              }
            },
            {
              $unwind: "$category.user"
            },{
                $group: {
                  _id: "$_id",
                  title: {
                    $first: "$title"
                  },price: {
                    $first: "$price"
                  },ogprice: {
                    $first: "$ogPrice"
                  },description: {
                    $first: "$description"
                  },image: {
                    $first: "$image"
                  },
                  
                  category: {
                    $push: {
                      _id: "$category._id",
                      Subcategory: "$category.subcategory",
                      Maincategory: "$category.user.category",
                      
                    }
                  }
                }
              }

            ]).toArray().then((response)=>{


                data=response[0]
                console.log(data)
                resolve(data)
                

            })
            
           
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

    addCatOffer : (brand,percent,end,offerName)=>{
        console.log(offerName)
        return new Promise(async (resolve,reject)=>{
            console.log("working")
            db.get().collection(collection.PRODUCT_COLLECTION).find({mainCategory : ObjectID(brand)  }).toArray().then(async (response)=>{
                console.log(response)
                console.log("check 3")
                
                for(i=0;i<response.length;i++){
                    response[i].ogPrice=parseInt(response[i].ogPrice)
                    let oldPrice =response[i].ogPrice
                    let newPrice=oldPrice-((oldPrice*percent)/100)
                    newPrice=newPrice.toString()
                    console.log("fffffffffffffffffffffff")
                    console.log(offerName);
                    

                   await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : response[i]._id},{$set : {price : newPrice , oldPrice : oldPrice,offer: true, cent : percent, expire: end, offerId : offerName} },{upsert:true}).then((response)=>{
                    console.log(response)
                    
                   })
                }
                resolve()
            })
        })
    },

    addProOffer : (prod,percent,end,offerName)=>{

        return new Promise(async (resolve,reject)=>{

            db.get().collection(collection.PRODUCT_COLLECTION).find({_id : ObjectID(prod) }).toArray().then(async (response)=>{
                console.log(response)
                console.log("heerererer")
                
                response[0].ogPrice=parseInt(response[0].ogPrice)
                let oldPrice =response[0].ogPrice
                let newPrice=oldPrice-((oldPrice*percent)/100)
                newPrice=newPrice.toString()
                console.log(end)


                   await  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : response[0]._id},{$set : {price : newPrice , oldPrice : oldPrice,offer: true, cent : percent, expire: end, offerId: offerName} },{upsert:true}).then((response)=>{
                    console.log(response)
                   })
                
            })
        })
    }

    

    

    
}

