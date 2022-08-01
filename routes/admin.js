var express = require('express');
var router = express.Router();
let userName = "owner"
let Pin = "12345"
const userHelpers = require('../helpers/user-helpers')

//Middleware to check the session

const adminVerify= (req,res,next)=>{

  if(req.session.users){
    next()
  } else{

    res.redirect('/admin')
  }

}

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.users){
  res.render('admin/login', { title: 'Express' });
  }
  
});

router.get('/dashboard',adminVerify,(req,res)=>{

  userHelpers.getAlluser().then((user)=>{
    console.log(user)
    res.render('admin/dashboard', { admin: true, user })
   })

})

router.post('/',(req,res,next)=>{
  const { email, password } = req.body;
  console.log(req.body)
  if (userName === email && Pin === password) {
    // req.session.check = true;
    req.session.users = true;
    res.redirect('/admin/dashboard')
    
  }
  else {
    
    req.session.err="incorrect username or password"
    res.render('admin/login',{alertLogin : 'Incorrect credentials'})
  }
})

router.get('/view-products',(req,res)=>{
  res.render('admin/view-products',{admin : true})
})

//Logout 

router.get('/logout',(req,res)=>{
  req.session.users=null
  res.redirect('/admin/')
})


module.exports = router;
