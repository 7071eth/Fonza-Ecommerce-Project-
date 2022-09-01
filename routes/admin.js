var express = require('express');
const {
  PRODUCT_COLLECTION
} = require('../config/collections');
var router = express.Router();
let userName = "owner"
let Pin = "12345"
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers')
const orderHelpers = require('../helpers/order-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const offerHelpers = require('../helpers/offer-helpers')
const upload = require("../multer/multer");
const {
  ObjectID
} = require('bson');
const {
  revenueTotal
} = require('../helpers/order-helpers');


const dayjs = require('dayjs');
const { response } = require('../app');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

//Middleware to check the session

const adminVerify = (req, res, next) => {

  if (req.session.users) {
    next()
  } else {

    res.redirect('/admin')
  }

}

/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.users) {
    console.log("Hellooo")
    res.redirect('/admin/dashboard')
  } else {
    res.render('admin/login', {
      title: 'Express'
    });
  }

});

router.get('/dashboard', adminVerify, (req, res) => {

  userHelpers.getAlluser().then(async (user) => {

    await orderHelpers.orderCount().then(async (data) => {

      await orderHelpers.orderStatus().then(async (orderStatus) => {

        await orderHelpers.revenueTotal().then(async (total) => {

          await orderHelpers.weeklyData().then(async (dailyData) => {

            await orderHelpers.yearlyData().then((yearlydata) => {

              console.log(yearlydata)
              res.render('admin/dashboard', {
                admin: true,
                user,
                data,
                orderStatus,
                total,
                dailyData,
                yearlydata
              })

            })




          })



        })

      })


    })


  })

})

router.post('/', (req, res, next) => {

  const {
    email,
    password
  } = req.body;
  console.log(req.body)
  if (userName === email && Pin === password) {
    // req.session.check = true;
    req.session.users = true;
    res.redirect('/admin/dashboard')

  } else {

    req.session.err = "incorrect username or password"
    res.render('admin/login', {
      alertLogin: 'Incorrect credentials'
    })
  }
})


//Logout 

router.get('/logout', (req, res) => {
  req.session.users = null
  res.redirect('/admin/')
})

router.post('/blockUser', (req, res) => {

  console.log(req.body)

  userHelpers.userStatus(req.body).then((user) => {
    res.json(user)
  })


})


router.get('/unblockUser/:id', (req, res) => {
  let userId = req.params.id
  userHelpers.unblockUser(userId).then((user) => {
    res.render('admin/dashboard', {
      admin: true,
      user
    })
  }).then((response) => {
    res.redirect('/admin/dashboard')
  })


})

// Products display and add

router.get('/view-products', (req, res) => {

  productHelpers.viewProduct().then((products) => {

    res.render('admin/view-products', {
      admin: true,
      products
    })
  })

})


router.get('/add-product', (req, res) => {
  productHelpers.lookupCategory().then((data) => {
    console.log(data)
    res.render('admin/add-products', {
      admin: true,
      data
    })

  })

})

router.post('/add-products', upload.array("image", 4), (req, res) => {


  console.log("Success")
  const files = req.files;

  if (!files) {
    const err = new Error("please choose the images");

    console.log(err)
  }

  var filenames = req.files.map(function (files) {
    return files.filename;
  });

  req.body.image = filenames;

  productHelpers.doAdd(req.body).then((resolve) => {

    console.log(req.body)
    res.redirect('/admin/add-product')

  })

})

//Product delete

router.get('/delete-product/:id', (req, res) => {

  let deleteIds = req.params.id
  productHelpers.deleteProduct(deleteIds).then((data) => {

    res.json("Success")
  }).catch((err) => {
    console.log(err)
  })
})

//Edit product

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.viewProductDetails(req.params.id);
  let categoryDetails = await productHelpers.lookupCategory();
  console.log(product)

  res.render('admin/edit-product', {
    admin: true,
    product,
    categoryDetails
  })

})

// Update product

router.post('/update-product/:id', upload.array("image", 4), (req, res) => {

  var filenames = req.files.map(function (files) {
    return files.filename;
  });

  req.body.image = filenames;

  let updateIds = req.params.id

  console.log(req.body)

  let prodDetails = req.body
  productHelpers.updateProduct(updateIds, prodDetails).then((data) => {

    console.log(data)
    res.redirect('/admin/view-products')

  }).catch((err) => {
    console.log(err)
  })
})



//Category Management


// View category 

router.get('/view-categories', (req, res) => {

  productHelpers.viewCategory().then((mainCategory) => {

    res.render('admin/categories', {
      admin: true,
      mainCategory
    })
  })


})

// Add category

router.post('/add-maincategory', (req, res) => {



  console.log(req.body)


  productHelpers.addCategory(req.body).then((data) => {

    console.log(data)
    res.redirect('/admin/view-categories')

  })
})

// Add Sub Category

router.post('/add-subcategory', (req, res) => {

  let newIds = ObjectID(req.body.mainCategory)
  req.body.mainCategory = newIds
  console.log(req.body)
  productHelpers.addSubCategory(req.body).then((data) => {
    console.log(data)
    res.redirect('/admin/view-categories')
  })

})

// Delete Main Category

// Delete Sub Category

router.get('/edit-subcategories', async (req, res) => {

  let categoryDetails = await productHelpers.lookupCategory();
  console.log(categoryDetails);

  res.render('admin/edit-category', {
    admin: true,
    categoryDetails
  })

})

router.post('/delete-subcategory', async (req, res) => {

  deleteIds = req.body.mainCategory

  await productHelpers.deleteSubCategory(deleteIds);
  await productHelpers.deleteProducts(deleteIds).then((data) => {
    console.log(data)
  });
  res.redirect('/admin/edit-subcategories')

})

//Orders

router.get('/orders', adminVerify, async (req, res) => {

  await orderHelpers.getAllOrders().then((orders) => {

    orders = orders.reverse()
    for (i = 0; i < orders.length; i++) {
      orders[i].date = orders[i].date.toDateString()
    }
    res.render('admin/orders', {
      admin: true,
      orders
    })

  })


})

//Change orders

router.post('/change-order', async (req, res) => {
  console.log(req.body)

  await orderHelpers.changeStatus(req.body).then((response) => {
    console.log(response)
    res.json(response)
  })
})

//Invoice

router.get('/invoice/:id', adminVerify, async (req, res) => {
  console.log("HElooooooooooooooo")
  let id = req.params.id
  console.log(id)

  await orderHelpers.getinvoice(req.params.id).then((data) => {
    console.log(data)
    console.log(data.cartProducts)
    res.render('admin/invoice', {
      admin: true,
      data
    })
  })

})

//Sales report

router.get('/sales-report/:id', adminVerify, async (req, res) => {

  if (req.params.id == 'daily') {

    await orderHelpers.dailyData().then(async (data) => {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();

      dt = year + "/" + month + "/" + day;

      res.render('admin/sales-report', {
        admin: true,
        data,
        title : 'Top 5 sold items',
        dt
      })

    })
  } else if (req.params.id == 'monthly') {
    await orderHelpers.activeUser().then(async (total) => {
      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();

      dt = year + "/" + month + "/" + day;

      
      res.render('admin/sales-report2', {
        admin: true,
        title: 'Top 5 active users',
        dt,
        total
      })
    })
  } else {

    await orderHelpers.monthlyData().then(async (total) => {
      let Ftotal = 0
      let s = 1
      for (i = 0; i < total.length; i++) {
        total[i].index = s
        Ftotal = Ftotal + total[i].totalAmount
        s++;
      }
      res.render('admin/sales-report', {
        admin: true,
        total,
        Ftotal,
        title: 'Yearly'
      })
    })

  }


})

//Coupons

router.get('/coupons', (req, res) => {
  res.render('admin/coupons', {
    admin: true
  })
})

//Edit coupons

router.get('/edit-coupon', (req, res) => {
  res.render('admin/edit-coupons', {
    admin: true
  })
})

//Add coupon

router.get('/add-coupon', async (req, res) => {


  res.render('admin/add-coupon', {
    admin: true
  })

})

//Remove coupon

router.post('/remove-coupon',(req,res)=>{
  console.log("Success")
})

router.post('/add-coupons', async (req, res) => {
  console.log(req.body)

  await couponHelpers.addCoupon(req.body)

  res.redirect('/admin/coupons')

})

//offers

router.get('/offers',async  (req, res) => {
  
  console.log(req.query)
  const {
    page=1,
    limit=10,
    select="category"

  } = req.query
  let selectId ={

  }
  console.log(select)
  if(select==="offer"){
    console.log("got it")
    selectId.offer=true
    selectId.pro=false
    selectId.cat=false
    
  }else if (select==="product") {
    selectId.offer=false
    selectId.pro=true
    selectId.cat=false

  }else {
    selectId.offer=false
    selectId.pro=false
    selectId.cat=true
    
  }
  console.log(selectId);
  let oPage = page
  let oLimit = limit

  let catOffers = await offerHelpers.catOffers()

  let offers = await offerHelpers.getOffers(oPage,oLimit)
  

  let offerCount = await offerHelpers.getCount()
  console.log(offerCount)
  let pagination =[]
  console.log(oPage)

  
  for(i=0;i<offerCount/10;i++){
    if(oPage==i+1){

      pagination.push({
        limit : 10,
        page : i+1,
        selected : true
      })
      console.log("Selectied")

    } else{
      pagination.push({
        limit : 10,
        page : i+1
      })
      console.log("Not found");
    }
   
  }
  console.log(pagination)
  
  for (i = 0; i < catOffers.length; i++) {
    catOffers[i].Offer.end = catOffers[i].Offer.end.toDateString()
    catOffers[i].offers=offers
  }
  console.log(catOffers)

  //

  let proOffers = await offerHelpers.proOffers()
  for (i = 0; i < proOffers.length; i++) {
    proOffers[i].Offer.end = proOffers[i].Offer.end.toDateString()
    proOffers[i].offers=offers
  }
  console.log(proOffers)

  //
  
  
  

  res.render('admin/offers', {
    admin: true,
    catOffers,
    proOffers,
    offers,
    pagination,
    selectId
  })
})

//Add offers
router.get('/add-offers', async (req, res) => {

  let category = await productHelpers.viewBrandProducts();
  let brands = await productHelpers.viewBrands();
  console.log(category)
  console.log(brands)

  res.render('admin/add-offers', {
    admin: true,
    brands,
    category
  })

})

router.post('/add-offers', async (req, res) => {
  console.log(req.body)
  if(Array.isArray(req.body.brands)){
    for(i=0;i<req.body.brands;i++){
      req.body.brands[i] =ObjectID(req.body.brands[i]) 
    }
  } else {
    req.body.brands =ObjectID(req.body.brands)
  }
  console.log("Reached here")
  offer =await offerHelpers.addOffer(req.body)
  
  oid=offer.insertedId
  console.log(oid);
  console.log("fhgfbgfgfh");
  
  
  if (req.body.brand==='true') {
    
    if(Array.isArray(req.body.brands)){
      console.log("checkpoint 1")
      for (i = 0; i < req.body.brands.length; i++) {
        brnd = req.body.brands[i]
        percent = req.body.percent
        expire = req.body.end
        console.log(expire)
        
        expire=new Date(expire)
        offerN=oid
        let  year = expire.getFullYear();
        // 👇️ getMonth returns integer from 0(January) to 11(December)
        let  month = expire.getMonth() + 1;
        let day = expire.getDate();
  
        expire = [year, month, day].join('/');
  
        console.log(expire)
        console.log(brnd,percent,expire)
        console.log(offerN)
        await offerHelpers.addCoffer(offerN,brnd)
        await productHelpers.addCatOffer(brnd, percent, expire,offerN)
      }

    } else {
      
      console.log("checkpoint 2")
        brnd = req.body.brands
        offerName = req.body.name
        percent = req.body.percent
        expire = req.body.end
        offerN=oid
        console.log(expire)
        expire=new Date(expire)
        let  year = expire.getFullYear();
        // 👇️ getMonth returns integer from 0(January) to 11(December)
        let  month = expire.getMonth() + 1;
        let day = expire.getDate();
  
        expire = [year, month, day].join('/');
  
        console.log(expire)
        await offerHelpers.addCoffer(offerN,brnd)
        console.log(brnd,percent,expire)
        productHelpers.addCatOffer(brnd, percent, expire,offerN)
      
    }

    
  } else {
    if(Array.isArray(req.body.products)){

      console.log("checkpoint 3")
      for (i = 0; i < req.body.products.length; i++) {
        prod = req.body.products[i]
        offerName = req.body.name
        percent = req.body.percent
        expire = req.body.end
        offerN=oid
        console.log(expire)
        expire=new Date(expire)
        let  year = expire.getFullYear();
        // 👇️ getMonth returns integer from 0(January) to 11(December)
        let  month = expire.getMonth() + 1;
        let day = expire.getDate();
  
        expire = [year, month, day].join('/');
  
        console.log(expire)
        console.log(prod,percent,expire)
        productHelpers.addProOffer(prod, percent, expire,offerN)
      }

    } else {
      

      prod = req.body.products
      offerName = req.body.name
      percent = req.body.percent
      expire = req.body.end
      console.log(expire)
      offerN=oid
      expire=new Date(expire)
      let  year = expire.getFullYear();
      // 👇️ getMonth returns integer from 0(January) to 11(December)
      let  month = expire.getMonth() + 1;
      let day = expire.getDate();

      expire = [year, month, day].join('/');

      console.log(expire)
      console.log(prod,percent,expire)
      productHelpers.addProOffer(prod, percent, expire,offerN)
      
    }
  }

  res.redirect('/admin/offers')
})

//Remove Cat offer

router.get('/remove-categoryOffer/:id',async (req,res)=>{

  let id = req.params.id
  let r = await offerHelpers.removeCategoryOffer(id)
  console.log(r)
  res.json("success")
})

//Remove Pro offer

router.get('/remove-productOffer/:id',async(req,res)=>{
  let id=req.params.id
  await offerHelpers.removeProductOffer(id)
  res.json("Success")
})

//Remove offers

router.get('/remove-offer/:id',async(req,res)=>{
  let id=req.params.id
  await offerHelpers.removeOffer(id).then((response)=>{
    res.json("Success")
  })
  
})

module.exports = router;