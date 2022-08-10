var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

const { ObjectID } = require('bson')
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
        data._id=ObjectID(data._id)
        return new Promise(async (resolve,reject)=>{
            
            console.log(data)
            await db.get().collection(collection.USER_COLLECTION).update({_id : data._id},{$push: {address : data.address[0]}}).then((response)=>{
                console.log(response)
            })
        })
    },

    

    


}
