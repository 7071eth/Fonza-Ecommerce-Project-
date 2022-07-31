var express = require('express');
var router = express.Router();
let userName = "owner"
let Pin = "12345"
const userHelpers = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/login', { title: 'Express' });
});

router.get('/dashboard',(req,res)=>{

  userHelpers.getAlluser().then((user)=>{
    console.log(user)
    res.render('admin/dashboard', { admin: true, user })
   })

})

router.post('/',function(req,res,next){
  const { email, password } = req.body;
  console.log(req.body)
  if (userName === email && Pin === password) {
    req.session.check = true;
    req.session.users = {
      userName
    }
    res.redirect('/admin/dashboard')
    
  }
  else {
    
    req.session.err="incorrect username or password"
    res.render('admin/login',{alertLogin : 'Incorrect credentials'})
  }
})


module.exports = router;
