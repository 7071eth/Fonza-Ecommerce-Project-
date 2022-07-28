var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/account',(req,res)=>{
  res.render('user/account')
})

router.post('/account',(req,res)=>{
  console.log(req.body);
  console.log("Success")
  res.send('success')
})


module.exports = router;
