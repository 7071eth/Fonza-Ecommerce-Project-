var db = require('../config/connection')
var collection = require('../config/collections')


const {
    ObjectID
} = require('bson')


module.exports = {



    addCoupon: (data) => {

        console.log(data)
        data.start= new Date(data.start)
        data.end= new Date(data.end)
        

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then((response) => {
                console.log(response)
                resolve(response)
            })


        })

    },

    couponStatus: (coupon) => {
        console.log(coupon)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLECTION).findOne({
                name: coupon.coupon
            }).then((response) => {

                var dt = new Date();

                console.log("here")
                console.log(dt)
                console.log(response.start)
                if (dt >= response.start && dt <= response.end) {
                    
                    console.log("APplicable")
                    response.status=true
                    resolve(response)
                }
                else{
                    response.status=false
                    resolve(response)
                }
            })
        })
    },

    check: (coupon)=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.COUPON_COLLECTION).findOne({name : coupon}).then((response)=>{
                resolve(response)
                
            })
        })
    },

    findCoupon: (coupon)=>{
        return new Promise (async (resolve,reject)=>{
            await db.get().collection(collection.COUPON_COLLECTION).findOne({_id: coupon}).then((response)=>{
                resolve(response)
            })
        })
    }



}