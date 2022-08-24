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

    



}