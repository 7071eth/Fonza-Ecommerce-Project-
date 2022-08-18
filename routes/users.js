const { urlencoded } = require('body-parser');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
require("dotenv").config();
const cartHelpers= require('../helpers/cart-helpers');
const orderHelpers=require('../helpers/order-helpers')
const { ObjectID } = require('bson');
const { response } = require('../app');

const paypal = require("paypal-rest-sdk");
// const { response } = require('../app');

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN,
  {
    lazyLoading: true,
  }
);

//Navbar middleware





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
 let brands = await productHelpers.viewBrands();
 console.log(brands)
 
 
  
  if(req.session.user)
  {
    for(i=0;i<category.length;i++){
      category[i].userDetails=req.session.user
    }
  
  userD = req.session.user._id
  console.log(userD)
  let cart = await cartHelpers.viewCart(userD)

  

 

  res.render('index',{category,user: true, cart,brands });

  }

  else {
    let brands = await productHelpers.viewBrands();
    console.log(brands)
    res.render('index',{category,brands});
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
  if(req.session.user){
    res.redirect('/')
  } else{
    res.render('user/login')
  }
  
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
    console.log("Reached here")
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
    var total=0;
    for(i=0;i<cart.length;i++){
      
      cart[i].subtotal=cart[i].quantity*cart[i].cartProducts.price;
      total=total+cart[i].quantity*cart[i].cartProducts.price
      
     
    }
    
    console.log(cart)
    console.log(total)
    res.render('user/cart',{user : true, cart,total})
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

//Checkout 

router.get('/checkout',async(req,res)=>{
  
  if(req.session.user){
    
    let cart = await cartHelpers.viewCart(req.session.user._id)
    var total=0;
    for(i=0;i<cart.length;i++){
      
      cart[i].subtotal=cart[i].quantity*cart[i].cartProducts.price;
      total=total+cart[i].quantity*cart[i].cartProducts.price
      
     
    }
    console.log("checkout ongoing");
    console.log(cart)
    console.log(req.session.user)
    let data =req.session.user
    res.render('user/checkout',{data,cart,total})
  } else {
    res.redirect('/User/login')
  }
  
})

//Add address

router.post('/add-address',(req,res)=>{
  
  if(req.session.user){

    req.session.user.address.unshift(req.body)
    console.log(req.session.user)
  
    userHelpers.addAddress(req.session.user)

    res.redirect('/User/checkout')

  } else{
    res.redirect('/User/login')
  }

})

//Place Order

router.post('/place-order',async (req,res)=>{
  if(req.session.user){
    req.body.status="Pending"

    let cart = await cartHelpers.viewCart(req.session.user._id)
    var total=0;
    for(i=0;i<cart.length;i++){
      
      cart[i].subtotal=cart[i].quantity*cart[i].cartProducts.price;
      total=total+cart[i].quantity*cart[i].cartProducts.price
      
     
    }

    req.body.cart=cart
    req.body.total=total
    req.body.user=ObjectID(req.body.user)
    
    
    req.body.date= new Date()

    
    
    await orderHelpers.placeOrder(req.body).then((orderId)=>{
      console.log(orderId)
      if(req.body.payment=="COD"){
        res.json({COD:true})
      } else  if (req.body.payment=='RAZORPAY'){
        userHelpers.generateRazorpay(orderId,total).then((response)=>{

          console.log(response)
          response.RAZORPAY=true
          res.json(response)
          
        })
      } else {

        userHelpers.converter(total).then((price) => {
          let converted = parseInt(price)
          
             
             userHelpers
               .generatePayPal(orderId.toString(), converted)
               .then((data) => {

                console.log(data)
                 res.json(data);

               });
           
        })
       
      }
    }); 

      }

    })

    



router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  
})

//Get Orders

router.get('/orders',async (req,res)=>{
  if(req.session.user){

    userId=ObjectID(req.session.user._id) 
    
    await orderHelpers.getOrders(userId).then((orders)=>{

      orders=orders.reverse()

      res.render('user/orders',{orders,user:true})
      
    })

    
    
  } else {
    res.redirect('/User/login')
  }
})

//Cancel Orders

router.post('/cancel-order',async (req,res)=>{

 order=ObjectID(req.body.invoice)
  await orderHelpers.updateStatus(order).then((response)=>{
    console.log(response,'hfhhhfhdfhf');
      res.json(response)
  })
  
  
})

// profile

router.get('/profile',(req,res)=>{
  res.render('user/profile',{user:true})
})

// Edit profile

router.get('/edit-profile',async (req,res)=>{
  if(req.session.user){

   let data = await userHelpers.viewProfile(req.session.user._id)
    console.log(data)
    res.render('user/edit-profile',{data,user:true})

  }else{
    res.redirect('/User/login')
  }
  
})

router.post('/change-profile',async(req,res)=>{
  
  if(req.session.user){

    req.body._id=ObjectID(req.session.user._id) 
    await userHelpers.updateProfile(req.body).then((response)=>{

      console.log(response)
      res.redirect('/User/edit-profile')
    })
    
  
    

  }else{
    res.redirect('/User/login')
  }
})

//Invoice

router.get('/invoice/:id',async (req,res)=>{
  console.log("HElooooooooooooooo")
  let id=req.params.id
  console.log(id)
  
  
  await orderHelpers.getinvoice(req.params.id).then((data)=>{
    console.log(data)
    console.log(data.cartProducts)
    res.render('user/invoice',{data})
  })
  
})

router.get('/brands/:id',async (req,res)=>{
  
 
  
  let brands = await productHelpers.viewBrands();
    
    products = await productHelpers.viewBrand(req.params.id)
    console.log(products)
  res.render('user/brands',{products,user:true,brands})
 

})



module.exports = router;
