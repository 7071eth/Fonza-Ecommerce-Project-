const { urlencoded } = require('body-parser');
var express = require('express');
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
router.get('/', function(req, res, next) {
  res.render('index');
});

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
    res.render('user/dashboard')
    }
   })
  }
)

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
     
      req.session.user=response.user
      req.session.loggedIn=true
      res.render('user/dashboard')
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


module.exports = router;
