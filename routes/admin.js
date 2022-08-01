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
    res.redirect('/admin/dashboard')
  }
  else{
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


//Logout 

router.get('/logout',(req,res)=>{
  req.session.users=null
  res.redirect('/admin/')
})

router.get('/blockUser/:id',(req,res)=>{
  let userId=req.params.id
  userHelpers.blockUser(userId).then((user)=>{
    res.render('admin/dashboard', { admin: true, user })
  }).then((response)=>{
    res.redirect('/admin/dashboard')
  })

  
})


router.get('/unblockUser/:id',(req,res)=>{
  let userId=req.params.id
  userHelpers.unblockUser(userId).then((user)=>{
    res.render('admin/dashboard', { admin: true, user })
  }).then((response)=>{
    res.redirect('/admin/dashboard')
  })

  
})

// Products display and add

router.get('/view-products',(req,res)=>{
  res.render('admin/view-products',{admin : true})
})


router.get('/add-products',(req,res)=>{
  res.render('admin/add-products',{admin : true})
})

//Category Management



module.exports = router;
