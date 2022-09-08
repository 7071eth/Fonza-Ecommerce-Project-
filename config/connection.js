var MongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
   // const url='mongodb://localhost:27017'
    const url ="mongodb+srv://fonza:anfal123@cluster0.dn5hws6.mongodb.net/?retryWrites=true&w=majority";
    const dbname='Fonza-Ecom'
    MongoClient.connect(url,(err,data)=>{
         if(err) return done(err)
         state.db=data.db(dbname)
         done()
    })

}

module.exports.get=function(){
    return state.db
}