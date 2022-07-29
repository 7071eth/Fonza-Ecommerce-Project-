const { urlencoded } = require('body-parser');
var express = require('express');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/account',(req,res)=>{
  res.render('user/account')
})

router.get('/login',(req,res)=>{
  res.render('user/login')
})


router.post('/account',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    if (response.status){
      req.session.signErr=true
      res.render('user/account',{alertEmail:"Sorry, email Already exists !"})
    }else{
    res.render('user/dashboard')
    }
   })
  }
)


module.exports = router;
