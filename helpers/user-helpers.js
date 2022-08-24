var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

const { ObjectID } = require('bson')
const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_juPuE4kQiJY8mm',
    key_secret: 'iDwhrTOvemDAsdEmdnDWjBam',
  });

  const paypal = require("paypal-rest-sdk");
  require("dotenv").config();

  paypal.configure({
    mode: "sandbox",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  });

  const CC = require("currency-converter-lt");
// const { response } = require('../app')

module.exports = {
    doSignup: (userData) => {
        console.log(userData)
        return new Promise(async (resolve, reject) => {
            let response = {}
            let email = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email });
            if (email) {
                console.log('same email');
                response.status = true
                resolve(response)

            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.status= true
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                })
                console.log('no same email');
                resolve({ status: false })
            }


        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ 
                email: userData.email })
            if (user) {
                
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },

    getAlluser:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },

    userStatus :  function (data) {
         return new Promise(async (resolve, reject) => {
            
            console.log(data)
            

            if(data.userStatus=='true'){
               
                 await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(data._id) }, { $set: { status: false } }).then((response)=>{
                    console.log("blocked")
                    resolve(false)
                })

            }
            
            else  {

                 await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectID(data._id) }, { $set: { status: true } }).then((response)=>{
                    console.log("unblocked")
                    resolve(true)
                })

            }
            console.log("Success")
            
           
            
        })
        
    },

    addAddress: (data)=>{
      console.log(data)
        data._id=ObjectID(data._id)
        return new Promise(async (resolve,reject)=>{
            
            console.log(data)
            await db.get().collection(collection.USER_COLLECTION).update({_id : data._id},{$push: {address : data.address[0]}}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },

    viewProfile: (id)=>{
        id=ObjectID(id)
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).findOne({_id: id}).then((response)=>{
            resolve(response)
           })
        })
    },

    updateProfile: (data)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(data)
           db.get().collection(collection.USER_COLLECTION).updateOne({_id : data._id},{$set : {username : data.username, number: data.number, email: data.email}}).then((response)=>{
            console.log(response)
            resolve(response)
           })
        })
    },

    generateRazorpay : (orderId,total)=>{
        return new Promise((resolve,reject)=>{
            
            var options = {
                amount: parseInt(total*100),  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err)
                } else{
                    console.log("New order created :",order);
                    resolve(order)
                }
                
              });

        })
    },

    
  generatePayPal: (orderId, totalPrice) => {
    
   
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        intent: "sale",
        payer: { 
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/User/orders",
          cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "Red Sox Hat",
                  sku: "001",
                  price: "0",
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: totalPrice,
            },
            description: "Hat for the best team ever",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          resolve(payment);
        }
      });
    });
  },

  converter: (price) => {
    return new Promise((resolve, reject) => {
     
        let currencyConverter = new CC({
          from: "INR",
          to: "USD",
          amount: price,
          isDecimalComma: false,
        });
      currencyConverter.convert().then((response) => {
       resolve(response)
      });
      
    });
 },

couponAdd: (data)=>{
  return new Promise((resolve,reject)=>{
    console.log("About to add coupon")
    console.log(data._id)
    console.log(data)
    data._id=ObjectID(data._id)
    db.get().collection(collection.USER_COLLECTION).updateOne({_id : data._id},{$push : {coupons : data.coupon}},{upsert: true}).then((response)=>{
      console.log(response)
      resolve(response)
    })
  })
  
},

checkCoupon: (data)=>{
  console.log(data)
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.USER_COLLECTION).findOne({$and :[{_id: data._id},{ coupons :  data.coupon }]}).then((response)=>{
      console.log(response)
      if(response==null){
        resolve(true)
      }else {
        resolve(false)
      }
    })
  })
}

    

    


}
