const {
  urlencoded
} = require('body-parser');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
require("dotenv").config();
const cartHelpers = require('../helpers/cart-helpers');
const orderHelpers = require('../helpers/order-helpers')
const referralCodeGenerator = require("referral-code-generator");
const {
  ObjectID
} = require('bson');
const {
  response
} = require('../app');

const paypal = require("paypal-rest-sdk");
const couponHelpers = require('../helpers/coupon-helpers');
const {
  array
} = require('../multer/multer');
// const { response } = require('../app');

const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN, {
    lazyLoading: true,
  }
);

//Navbar middleware

// router.use((req,res,next)=>{
//   req.session.user={
//     _id: '62e7c5f1200fba3c81dd2324',
//     username: 'Kelvin George',
//     email: 'kelvin@gmail.com',
//     password: '$2b$10$vCFDpjvIHIqVUcIJu01s0uP65l6blzKBysb9fQ1AYvnQGR6tmj0Jy',
//     number: '1234124232314',
//     agree: 'on',
//     status: true,
//     coupons: []
//   }
//   next ()
// })




//Middleware to check the session

const userVerify = (req, res, next) => {

  if (req.session.user) {
    next()
  } else {

    res.redirect('/User/login')
  }

}


/* Home page. */
router.get('/', async function (req, res, next) {


  let category = await productHelpers.viewBrandProducts();
  let brands = await productHelpers.viewBrands();
  console.log(brands)
  console.log(category)

  console.log(req.session.user)

  if (req.session.user) {
    for (i = 0; i < category.length; i++) {
      category[i].userDetails = req.session.user
    }

    userD = req.session.user._id
    console.log(userD)
    let tQuantity = 0
    let total = 0
    let cart = await cartHelpers.viewCart(userD)
    for (i = 0; i < cart.length; i++) {
      tQuantity = tQuantity + cart[i].quantity
      total = total + parseInt(cart[i].cartProducts.price) * cart[i].quantity
    }





    res.render('index', {
      category,
      user: true,
      cart,
      brands,
      tQuantity,
      total
    });

  } else {
    let brands = await productHelpers.viewBrands();
    console.log(brands)
    res.render('index', {
      category,
      brands
    });
  }

});

/* GET product details. */
router.get('/productDetails/:id', (req, res, next) => {
  console.log(req.params.id)
  id = req.params.id
  productHelpers.viewProductDetails(id).then((productOne) => {

    console.log(productOne)



    res.render('user/productDetails', {
      productOne


    })


  })

})

router.get('/account', (req, res) => {
  if (req.session.user) {
    res.redirect('/', )
  } else {
    res.render('user/account')
  }

})

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login')
  }

})


router.post('/account', async (req, res) => {
  if (req.body.referal != "") {
    await userHelpers.checkReferal(req.body.referal).then((response) => {
      if (response) {
        delete(req.body.referal)
        let rCode = referralCodeGenerator.alphaNumeric("uppercase", 2, 2);
        req.body.refferalCode = rCode;
        req.body.wallet = 200
        console.log(rCode)
        userHelpers.doSignup(req.body).then((response) => {
          console.log(response)
          if (response) {
            req.session.signErr = true
            res.render('user/account', {
              alertEmail: "Sorry, email Already exists !"
            })
          } else {
            res.redirect('/User/login')
          }
        })
      } else {

        delete(req.body.referal)
        let rCode = referralCodeGenerator.alphaNumeric("uppercase", 2, 2);
        req.body.refferalCode = rCode;
        console.log(rCode)
        userHelpers.doSignup(req.body).then((response) => {
          if (response.status) {
            req.session.signErr = true
            res.render('user/account', {
              alertEmail: "Sorry, email Already exists !"
            })
          } else {
            res.redirect('/User/login')
          }
        })
      }
    })

  } else {

    let rCode = referralCodeGenerator.alphaNumeric("uppercase", 2, 2);
    req.body.refferalCode = rCode;
    console.log(rCode)
    userHelpers.doSignup(req.body).then((response) => {
      if (response.status) {
        req.session.signErr = true
        res.render('user/account', {
          alertEmail: "Sorry, email Already exists !"
        })
      } else {
        res.redirect('/User/login')
      }
    })

  }
})

//Add product to cart

router.post('/add-to-cart', (req, res) => {


  console.log("reached here");

  console.log(req.body)

  cartHelpers.addToCart(req.body).then((response) => {

    console.log(response)
    res.json(response)
  })



})

//Login 

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.loggedIn = true
      res.redirect('/')
    } else {
      req.session.loginErr = true
      res.render('user/login', {
        alertLogin: "Incorrect Credentials"
      })
    }
  })
})

//Logout

router.get('/logout', (req, res) => {

  req.session.user = null
  res.redirect('/')

})


router.get('/getOtp', (req, res) => {
  res.render('user/getOtp')
})

//OTP generating

router.post('/getOtp', (req, res) => {

  const {
    number
  } = req.body;

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

  const {
    otp
  } = req.body;

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
        res.send("Success1232")
      } else if (resp.valid == true) {
        res.redirect("/");
      }
    });
});

router.get('/otpLogin', (req, res) => {
  res.render('user/otpLogin')
})

// Account

router.get('/account', (req, res) => {
  res.render('user/userAccount')
})


// Cart

router.get('/cart', async (req, res) => {
  if (req.session.user) {
    let userD = req.session.user._id
    let cart = await cartHelpers.viewCart(userD)

    var total = 0;
    var offerDis=0
    var offerS=false
    for (i = 0; i < cart.length; i++) {

      if(cart[i].cartProducts.offer){

        cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
        total = total + cart[i].quantity * cart[i].cartProducts.price
        offerDis=offerDis+(parseInt(cart[i].cartProducts.ogPrice)-parseInt(cart[i].cartProducts.price))
        offerS=true
      } else {

        cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
        total = total + cart[i].quantity * cart[i].cartProducts.price

      }
      

      
    }
    if(offerS){
      cart.offerD=offerDis
      cart.offerS=true
    }
    console.log(offerS)
    console.log(offerDis)
    
    cart.total = total

    if (cart.length == 0) {

      cart.empty = true

    } else

    {
      if (cart[0].coupon != null) {

        cart.cStatus = true
        findId = cart[0].coupon
        let data = await couponHelpers.findCoupon(findId)

        cart.cName = data.name
        data.percent = parseInt(data.percent)
        data.disAmount = parseInt(data.disAmount)
        console.log(data)

        disPrice = (data.percent * cart.total) / 100
        
        if (disPrice > data.disAmount) {
          newPrice = cart.total - data.disAmount
          cart.newPrice = newPrice
          cart.disAmt=data.disAmount

        } else {
          newPrice = cart.total - disPrice
          cart.newPrice = newPrice
          cart.disAmt=disPrice
        }

        console.log(cart)


      }
    }



    console.log(cart)
    console.log(total)
    res.render('user/cart', {
      user: true,
      cart,
      total,
    })
  } else {
    res.render('user/login')
  }

})

//Delete Cart product

router.get('/remove-product/:id', async (req, res) => {
  prodId = ObjectID(req.params.id)
  userId = req.session.user

  if (req.session.user) {

    await cartHelpers.removeProduct(prodId, userId).then((response) => {
      console.log(response)
      res.redirect('/User/cart')
    })

  } else {
    res.render('user/login')
  }
})

//Checkout 

router.get('/checkout', async (req, res) => {

  if (req.session.user) {

    let userD = req.session.user._id
    let cart = await cartHelpers.viewCart(userD)

    let offerDis =0
    var total = 0;
    for (i = 0; i < cart.length; i++) {

      if(cart[i].cartProducts.offer){

        cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
        total = total + cart[i].quantity * cart[i].cartProducts.price
        offerDis=offerDis+(parseInt(cart[i].cartProducts.ogPrice)-parseInt(cart[i].cartProducts.price))
        offerS=true
      } else {

        cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
        total = total + cart[i].quantity * cart[i].cartProducts.price

      }

      
    }

    if(offerS){
      cart.offerD=offerDis
      cart.offerS=true
    }
    cart.total = total
    console.log(cart)
    if (cart.length != 0) {


      if (cart[0].coupon != null) {

        cart.cStatus = true
        findId = cart[0].coupon
        let data = await couponHelpers.findCoupon(findId)

        cart.cName = data.name
        data.percent = parseInt(data.percent)
        data.disAmount = parseInt(data.disAmount)
        console.log(data)

        disPrice = (data.percent * cart.total) / 100
        if (disPrice > data.disAmount) {
          newPrice = cart.total - data.disAmount
          cart.newPrice = newPrice
          cart.disAmt = data.disAmount
        } else {
          newPrice = cart.total - disPrice
          cart.newPrice = newPrice
          cart.disAmt = disPrice
        }

        console.log(cart)


      }
    }

    console.log(cart)
    console.log(total)

    console.log("checkout ongoing");
    console.log(cart)
    console.log(req.session.user)
    let data = req.session.user
    res.render('user/checkout', {
      user: true,
      data,
      cart,
      total
    })
  } else {
    res.redirect('/User/login')
  }

})

//Address

router.get('/address', (req, res) => {
  if (req.session.user) {
    res.render('user/address')
  }
})

//Add address

router.post('/add-address', (req, res) => {
  console.log(req.body)
  if (req.session.user) {
    if(req.session.user.address){
      req.session.user.address.unshift(req.body)
    } else {
      req.session.user.address=[]
      req.session.user.address.push(req.body)
    }
    
    console.log(req.session.user)

    userHelpers.addAddress(req.session.user)

    res.redirect('/User/checkout')

  } else {
    res.redirect('/User/login')
  }

})

//Place Order

router.post('/place-order', async (req, res) => {
  if (req.session.user) {
    req.body.status = "Pending"

    let userD = req.session.user._id
    let cart = await cartHelpers.viewCart(userD)

    var total = 0;
    for (i = 0; i < cart.length; i++) {

      cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
      total = total + cart[i].quantity * cart[i].cartProducts.price


    }
    cart.total = total
    console.log(cart)
    if (cart.length != 0) {


      if (cart[0].coupon != null) {

        cart.cStatus = true
        findId = cart[0].coupon
        let data = await couponHelpers.findCoupon(findId)

        cart.cName = data.name
        data.percent = parseInt(data.percent)
        data.disAmount = parseInt(data.disAmount)
        console.log(data)

        disPrice = (data.percent * cart.total) / 100
        if (disPrice > data.disAmount) {
          newPrice = cart.total - data.disAmount
          cart.newPrice = newPrice
          cart.disAmt = data.disAmount
          total = newPrice
        } else {
          newPrice = cart.total - disPrice
          cart.newPrice = newPrice
          cart.disAmt = disPrice
          total = newPrice
        }

        console.log(cart)


      }
    }


    req.body.cart = cart
    req.body.total = total
    req.body.user = ObjectID(req.body.user)


    req.body.date = new Date()



    await orderHelpers.placeOrder(req.body).then((orderId) => {
      console.log(orderId)
      if (req.body.payment == "COD") {
        res.json({
          COD: true
        })
      } else if (req.body.payment == 'RAZORPAY') {
        userHelpers.generateRazorpay(orderId, total).then((response) => {

          console.log(response)
          response.RAZORPAY = true
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



// Payment verifications

router.post('/verify-payment', (req, res) => {
  console.log('verifyPayment');
  console.log(req.body);
  orderHelpers.verifyPayment(req.body).then((response) => {

    console.log("AM Herrrrrrrrrrrrrrr")
    res.json("Success")

  }).catch((err) => {
    console.log('Payment failed!!!');
    console.log(err);
    res.json({
      status: false
    })
  })
})

//Get Orders

router.get('/orders', async (req, res) => {
  if (req.session.user) {

    userId = ObjectID(req.session.user._id)

    await orderHelpers.getOrders(userId).then((orders) => {
      console.log(orders)
      orders = orders.reverse()
      for (i = 0; i < orders.length; i++) {
        orders[i].date = orders[i].date.toDateString()
      }

      res.render('user/orders', {
        orders,
        user: true
      })

    })



  } else {
    res.redirect('/User/login')
  }
})

//Cancel Orders

router.post('/cancel-order', async (req, res) => {

  order = ObjectID(req.body.invoice)
  await orderHelpers.updateStatus(order).then((response) => {
    console.log(response, 'hfhhhfhdfhf');
    res.json(response)
  })


})

// profile

router.get('/profile', (req, res) => {
  res.render('user/profile', {
    user: true
  })
})


// Edit profile

router.get('/edit-profile', async (req, res) => {
  if (req.session.user) {

    let data = await userHelpers.viewProfile(req.session.user._id)
    console.log(data)
    res.render('user/edit-profile', {
      data,
      user: true
    })

  } else {
    res.redirect('/User/login')
  }

})

router.post('/change-profile', async (req, res) => {

  if (req.session.user) {

    req.body._id = ObjectID(req.session.user._id)
    await userHelpers.updateProfile(req.body).then((response) => {

      console.log(response)
      res.redirect('/User/edit-profile')
    })




  } else {
    res.redirect('/User/login')
  }
})


//Invoice

router.get('/invoice/:id', async (req, res) => {
  console.log("HElooooooooooooooo")
  let id = req.params.id
  console.log(id)


  await orderHelpers.getinvoice(req.params.id).then((data) => {
    console.log(data)
    console.log(data.cartProducts)
    res.render('user/invoice', {
      data
    })
  })

})

router.get('/brands/:id', async (req, res) => {



  let brands = await productHelpers.viewBrands();

  products = await productHelpers.viewBrand(req.params.id)
  console.log(products)
  res.render('user/brands', {
    products,
    user: true,
    brands
  })


})

router.get('/products', (req, res) => {
  res.render('user/products')
})


//Apply coupon

router.post('/apply-coupon', async (req, res) => {
  console.log(req.body)

  let checkData = {}
  checkData._id = ObjectID(req.session.user._id)


  await couponHelpers.check(req.body.coupon).then(async (response) => {
    console.log(response)
    let newData = {}
    if (response != null) {
      checkData.coupon = ObjectID(response._id)
      await userHelpers.checkCoupon(checkData).then(async (response) => {


        console.log(response)
        if (response) {
          console.log("Not Used")
          newData.used = false
          await couponHelpers.couponStatus(req.body).then(async (response) => {

            console.log(response)
            if (response.status) {
              console.log("Not expired")
              let Cdata = {}
              Cdata._id = req.session.user._id
              Cdata.coupon = response._id

              await cartHelpers.insertCoupon(Cdata)
              console.log("Coupon added")
              let cart = await cartHelpers.viewCart(req.session.user._id)
              var total = 0;
              for (i = 0; i < cart.length; i++) {

                cart[i].subtotal = cart[i].quantity * cart[i].cartProducts.price;
                total = total + cart[i].quantity * cart[i].cartProducts.price


              }
              console.log(total)
              response.totalAmount = parseInt(response.totalAmount)
              response.disAmount = parseInt(response.disAmount)
              response.percent = parseInt(response.percent)
              if (total > response.totalAmount) {

                cartHelpers.insertCoupon(Cdata)

                console.log("CHeckpoin 1")
                disPrice = (response.percent * total) / 100
                if (disPrice > response.disAmount) {
                  console.log("CHeckpoin 2")
                  newPrice = total - response.disAmount
                  newData.exist = true
                  newData.used = false
                  newData.status = true
                  newData.newPrice = newPrice
                  newData.amt = response.disAmount
                  newData.total = true
                  newData.status = true
                  res.json(newData)

                } else {

                  console.log("CHeckpoin 3")
                  newPrice = total - disPrice
                  newData.newPrice = newPrice
                  newData.amt = response.disPrice
                  newData.total = true
                  newData.status = true
                  res.json(newData)

                }
              } else {
                console.log("CHeckpoin 4")
                newData.exist = true
                newData.used = false
                newData.status = true
                newData.total = false
                newData.status = true
                res.json(newData)
              }
            } else {

              console.log("CHeckpoin 5")
              newData.exist = true
              newData.used = false
              newData.status = false
              res.json(newData)
            }

          })

        } else {
          newData.exist = true
          newData.used = true
          res.json(newData)
        }



      })
    } else {
      newData.exist = false
      res.json(newData)
    }
  })



})

//Remove Coupon

router.post('/remove-coupon', async (req, res) => {

  total = req.body.total
  let removeData = {}
  removeData._id = ObjectID(req.session.user._id)
  cartHelpers.removeCoupon(removeData).then((response) => {
    response.total = total
    res.json(response)
  })

})

//Referrals

router.get('/referals', (req, res) => {
  console.log(req.session.user)
  code = req.session.user.refferalCode
  res.render('user/referals', {
    code
  })
})



module.exports = router;