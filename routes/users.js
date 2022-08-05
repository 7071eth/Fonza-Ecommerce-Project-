const { urlencoded } = require('body-parser');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
require("dotenv").config();

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN,
  {
    lazyLoading: true,
  }
);


/* GET users listing. */
router.get('/', async function(req, res, next) {

 let products = await productHelpers.viewProduct()
 let category = await productHelpers.viewBrandProducts();
 

  console.log(category)
  


  res.render('index',{products,category});

  
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

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
     
      req.session.user=response.user
      req.session.loggedIn=true
      res.redirect('/User/')
    }else{
      req.session.loginErr=true
      res.render('user/login',{alertLogin: "Incorrect Credentials"})
    }
  })
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




module.exports = router;
