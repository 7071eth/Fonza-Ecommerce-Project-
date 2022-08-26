var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

const {
    ObjectID
} = require('bson')
// const { response } = require('../app')

module.exports = {

    addToCart: (data) => {

        data.user = ObjectID(data.user)
        data.product = ObjectID(data.product)
        data.count = parseInt(data.count)
        let count = parseInt(data.count)
        console.log(data)
        data.quantity = parseInt(data.quantity)


        console.log("Data")
        console.log(data)

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CART_COLLECTION).findOne({
                $and: [{
                    user: data.user
                }, {
                    product: data.product
                }]
            }).then((response)=>{
                console.log(response)
            })

            if (await db.get().collection(collection.CART_COLLECTION).findOne({
                    $and: [{
                        user: data.user
                    }, {
                        product: data.product
                    }]
                })) {

                
                if (count === -1 && data.quantity <= 1) {

                    await db.get().collection(collection.CART_COLLECTION).deleteOne({
                        $and: [{
                            user: data.user
                        }, {
                            product: data.product
                        }]
                    })
                }
                if (count != -1) {
                    let price = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({
                        _id: data.product
                    })
                    await db.get().collection(collection.CART_COLLECTION).updateOne({
                        $and: [{
                            user: data.user
                        }, {
                            product: data.product
                        }]
                    }, {
                        $inc: {
                            quantity: 1
                        }
                    }).then((response) => {
                        console.log(response)
                        console.log(" Changed quantity")
                        response.c = parseInt(1)
                        response.quantity = data.quantity
                        response.price = price.price
                        response.title = price.title




                        response.prod = data.product
                        resolve(response)

                    })
                } else {

                    let price = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({
                        _id: data.product
                    })
                    await db.get().collection(collection.CART_COLLECTION).updateOne({
                        $and: [{
                            user: data.user
                        }, {
                            product: data.product
                        }]
                    }, {
                        $inc: {
                            quantity: -1
                        }
                    }).then((response) => {
                        console.log(response)
                        console.log(" Changed quantity")
                        response.c = parseInt(-1)
                        response.quantity = data.quantity
                        response.price = price.price
                        response.title = price.title

                        response.prod = data.product
                        resolve(response)
                    })

                }

            } else {
                console.log("Adding new product")
                let price = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({
                    _id: data.product
                })
                await db.get().collection(collection.CART_COLLECTION).insertOne(data).then((response) => {
                    console.log(data)
                    console.log(response)
                    response.price=price.price
                    resolve(response)
                    console.log("Added new product")

                })
            }








        })
    },

    viewCart: (data) => {

        let _id = ObjectID(data)

        return new Promise(async (resolve, reject) => {

            console.log("This is the data " + _id)

            let cData = await db.get().collection(collection.CART_COLLECTION).aggregate([{

                    $match: {
                        user: _id
                    }


                }, {

                    $lookup: {
                        from: 'product',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'cartProducts'
                    }



                },
                {

                    $unwind: {

                        path: "$cartProducts"
                    }
                }
            ]).toArray()
            console.log(cData)
            resolve(cData)

        })

    },

    removeProduct: (prodId, userId) => {

        console.log(prodId)
        console.log(userId)
        let userD = ObjectID(userId._id)
        console.log(userD)

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CART_COLLECTION).deleteOne({
                $and: [{
                    user: userD
                }, {
                    product: prodId
                }]
            }).then((response) => {
                console.log(response)
            })

            resolve("Removed successfully")


        })
    },

    insertCoupon: (data) => {
        console.log(data)
        data._id = ObjectID(data._id)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION).updateMany({
                user: data._id
            }, {
                $set: {
                    coupon: data.coupon
                }
            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    removeCoupon: (data) => {
        console.log(data)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CART_COLLECTION).updateMany({
                user: data._id
            }, {
                $set: {
                    coupon: null
                }
            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    }



}