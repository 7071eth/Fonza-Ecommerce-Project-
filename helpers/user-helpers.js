var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const collections = require('../config/collections')

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

    getAlluser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },

}
