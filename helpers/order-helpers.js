var db = require('../config/connection')
var collection = require('../config/collections')

require("dotenv").config();


const {
    ObjectID
} = require('bson')




module.exports = {



    placeOrder: (data) => {



        return new Promise(async (resolve, reject) => {
            console.log(data)
            await db.get().collection(collection.ORDER_COLLECTION).insertOne(data).then(async (response) => {

                await db.get().collection(collection.CART_COLLECTION).deleteMany({
                    user: data.user
                })
                resolve(response.insertedId)
            })

        })


    },

    getOrders: (id) => {

        console.log(id)

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).find({
                user: id
            }).toArray().then((response) => {
                resolve(response)
            })

        })

    },

    updateStatus: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: id
            }, {
                $set: {
                    status: "Cancelled"
                }
            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    getAllOrders: () => {



        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ORDER_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })

        })

    },

    changeStatus: (data) => {

        id = ObjectID(data.invoice)
        newStatus = data.status

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: id
            }, {
                $set: {
                    status: newStatus
                }
            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    getinvoice: (invoice) => {
        console.log(invoice);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).findOne({
                _id: ObjectID(invoice)
            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    orderCount: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{

                    $project: {

                        newDate: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date"
                            }
                        }

                    }

                },
                {
                    $group: {
                        _id: "$newDate",
                        count: {
                            $count: {}
                        }
                    }
                },
                {

                    $sort: {
                        _id: -1
                    }

                },
                {

                    $limit: 7
                }
            ]).toArray().then((data) => {

                console.log(data)
                resolve(data)
            })

        })
    },

    orderStatus: () => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $group: {
                        _id: "$status",
                        count: {
                            $count: {}
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }

            ]).toArray().then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },

    revenueTotal: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{

                    $project: {

                        newDate: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date"
                            }
                        },
                        total: 1

                    }

                },
                {
                    $group: {
                        _id: "$newDate",
                        totalAmount: {
                            $sum: "$total"
                        }
                    }


                },
                {

                    $sort: {
                        _id: 1
                    }

                },
                {

                    $limit: 7
                }
            ]).toArray().then((data) => {

                console.log(data)
                resolve(data)
            })

        })
    },

    yearlyData: () => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ORDER_COLLECTION).aggregate([{

                    $project: {

                        year: {
                            $year: "$date"
                        },
                        total: 1

                    }

                },
                {
                    $group: {
                        _id: "$year",
                        totalAmount: {
                            $sum: "$total"
                        }
                    }
                },
                {

                    $sort: {
                        _id: 1
                    }

                },
                {

                    $limit: 10
                }



            ]).toArray().then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    weeklyData: () => {

        return new Promise((resolve,reject)=>{

            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project : {
                        date :1 ,
                        total : 1,
                        _id: 0
                    }
                },
                {
                $match: {
                    
                        
                            date : {
                                $gte: new Date(
                                    (new Date() - (7* 24 * 60 * 60 * 1000))
                                )
                            }
                        
                    
                }
            },
            {

                $project: {

                    newDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    },
                    total: 1

                }

            },{
                $group: {
                    _id: "$newDate",
                    totalAmount: {
                        $sum: "$total"
                    }
                }


            },{
                $sort : {
                    _id : 1
                }
            }

            ]).toArray().then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
        
        
    },
    dailyData: () => {

        return new Promise((resolve,reject)=>{

            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: {
                      path: "$cart",
                    },
                  },
                  {
                    $group: {
                      _id: "$cart.product",
                      title: {
                        $first: "$cart.cartProducts.title",
                      },
                      price:{
                        $first : "$cart.cartProducts.price"
                      },
                      totalSold: {
                        $sum: 1,
                      },
                    },
                  },
                  {
                    $sort: {
                      totalSold: -1,
                    },
                  },
                  {
                    $limit: 5,
                  },
                  

            ]).toArray().then((data)=>{
                console.log(data)
                resolve(data)
                
            })
        })
        
        
    },
    activeUser: () => {

        return new Promise((resolve,reject)=>{

            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                  {
                    $group: {
                      _id: "$user",
                      
                      totalOrders: {
                        $sum: 1,
                      },
                    },
                  },
                  {
                    $sort: {
                      totalOrders: -1,
                    },
                  },
                  {
                    $limit: 10,
                  },
                  {
                    $lookup: {
                        from: 'user',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'Users'
                      }
                },{
                    $unwind : {
                        path : "$Users"
                    }
                }
                  

            ]).toArray().then((data)=>{
                console.log(data)
                resolve(data)
                
                
            })
        })
        
        
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            console.log('userHelpers-verifyPayment');
            const crypto = require("crypto");
            let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
            console.log(details)
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')

            console.log(hmac)
            console.log(details['payment[razorpay_signature]'])
            

            if (hmac == details['payment[razorpay_signature]']) {
                console.log("Payment success")
                resolve()

            } else {
                reject()

            }
        })
    },

    walletUpdate : (bal,id)=>{
        
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id : ObjectID(id) },{$set : {wallet : bal}}).then((response)=>{
                resolve(response)
            })
           
        })
    },

    walletBalance : (id)=>{
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).findOne({_id : ObjectID(id) }).then((response)=>{
                resolve(response.wallet)
            })
           
        })
    }



}