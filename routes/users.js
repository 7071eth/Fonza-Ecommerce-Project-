const { urlencoded } = require('body-parser');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
require("dotenv").config();
const cartHelpers= require('../helpers/cart-helpers');
const { ObjectID } = require('bson');
const { response } = require('../app');

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN,
  {
    lazyLoading: true,
  }
);

//Middleware to check the session

const userVerify= (req,res,next)=>{

  if(req.session.user){
    next()
  } else{

    res.redirect('/User/login')
  }

}


/* Home page. */
router.get('/', async function(req, res, next) {

 
 let category = await productHelpers.viewBrandProducts();
 
  
  if(req.session.user)
  {
    for(i=0;i<category.length;i++){
      category[i].userDetails=req.session.user
    }
  console.log(category)
  userD = req.session.user._id
  console.log(userD)
  let cart = await cartHelpers.viewCart(userD)

  res.render('index',{category,user: true, cart });

  }

  else {
    res.render('index',{category});
  }
  
});

/* GET product details. */
router.get('/productDetails/:id',(req,res,next)=>{
  console.log(req.params.id)
  productHelpers.viewProductDetails(req.params.id).then((productOne)=>{
    console.log(productOne)
    res.render('user/productDetails',{productOne})
  })

})

router.get('/account',(req,res)=>{
  res.render('user/account',)
})

router.get('/login',(req,res)=>{
  res.render('user/login')
})


router.post('/account',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    if (response.status){
      req.session.signErr=true
      res.render('user/dashboard',{alertEmail:"Sorry, email Already exists !"})
    }else{
      res.redirect('/User/login')
    }
   })
  }
)

//Add product to cart

router.post('/add-to-cart',(req,res)=>{

  
  console.log("reached here");
  console.log(req.body)
  cartHelpers.addToCart(req.body).then((response)=>{
      console.log(response)
      res.json(response)
  })
  


})

//Login 

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
     
      req.session.user=response.user
      req.session.loggedIn=true
      res.redirect('/')
    }else{
      req.session.loginErr=true
      res.render('user/login',{alertLogin: "Incorrect Credentials"})
    }
  })
})

//Logout

router.get('/logout',(req,res)=>{
  
      req.session.user=null
      res.redirect('/')

})


router.get('/getOtp',(req,res)=>{
  res.render('user/getOtp')
})

//OTP generating

router.post('/getOtp',(req,res)=>{
  
  const { number } = req.body;

        console.log(number);
        User_number = number;
        client.verify.services(process.env.SERVICE_SID).verifications.create({
          to: `+91${number}`,
          channel: "sms",
        });

        res.render('user/otpLogin')
})

//OTP match checking

router.post("/otp-matching", function (req, res) {

  const { otp } = req.body;
  
  client.verify
    .services(process.env.SERVICE_SID)
    .verificationChecks.create({
      to: `+91${User_number}`,
      channel: "sms",
      code: otp,
    })
    .then((resp) => {
      if (resp.valid == false) {
        req.session.otp = true;
        let otpvalidation = req.session.otp;
        res.send("Success")
      } else if (resp.valid == true) {
        res.redirect("/");
      }
    });
});

router.get('/otpLogin',(req,res)=>{
  res.render('user/otpLogin')
})

// Account

router.get('/account',(req,res)=>{
  res.render('user/userAccount')
})


// Cart

router.get('/cart',async (req,res)=>{
  if(req.session.user){

    let cart = await cartHelpers.viewCart(userD)
    console.log(cart)
    res.render('user/cart',{user : true, cart})
  } else {
    res.render('user/login')
  }
  
})

//Delete Cart product

router.get('/remove-product/:id',async (req,res)=>{
  prodId= ObjectID(req.params.id)
  userId= req.session.user
  
  if(req.session.user){
    
    await cartHelpers.removeProduct(prodId,userId).then((response)=>{
      console.log(response)
      res.redirect('/User/cart')
    })

  } else {
    res.render('user/login')
  }
})

module.exports = router;
