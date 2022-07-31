var express = require('express');
var router = express.Router();
let userName = "owner"
let Pin = "12345"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/login', { title: 'Express' });
});

router.post('/',function(req,res,next){
  const { Email, Password } = req.body;
  if (userName === Email && Pin === Password) {
    req.session.check = true;
    req.session.users = {
      userName
    }
    res.render('admin/dashboard')
  }
  else {
    req.session.err="incorrect username or password"
    res.redirect('/admin/')
  }
})

module.exports = router;
