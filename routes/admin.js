var express = require('express');
const { PRODUCT_COLLECTION } = require('../config/collections');
var router = express.Router();
let userName = "owner"
let Pin = "12345"
const userHelpers = require('../helpers/user-helpers')
const productHelpers= require('../helpers/product-helpers')
const orderHelpers=require('../helpers/order-helpers')
const upload = require("../multer/multer");
const { ObjectID } = require('bson');

//Middleware to check the session

const adminVerify= (req,res,next)=>{

  if(req.session.users){
    next()
  } else{

    res.redirect('/admin')
  }

}

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.users){
    
    res.redirect('/admin/dashboard')
  }
  else{
    res.render('admin/login', { title: 'Express' });
  }

});

router.get('/dashboard',adminVerify,(req,res)=>{

  userHelpers.getAlluser().then(async (user)=>{

    await orderHelpers.orderCount().then((data)=>{
      
      res.render('admin/dashboard', { admin: true, user,data })
    })
    
    
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

router.post('/blockUser',(req,res)=>{
  
  console.log(req.body)
  
  userHelpers.userStatus(req.body).then((user)=>{
    res.json(user)
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

  productHelpers.viewProduct().then((products)=>{
    
    res.render('admin/view-products',{admin : true, products})
  })
  
})


router.get('/add-product',(req,res)=>{
  productHelpers.lookupCategory().then((data)=>{
    console.log(data)
    res.render('admin/add-products',{admin:true, data})

  })
  
})

router.post('/add-products',upload.array("image",4),(req,res)=>{

  
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

  productHelpers.doAdd(req.body).then((resolve)=>{

    console.log(req.body)
    res.redirect('/admin/add-product')
    
  })

})

//Product delete

router.get('/delete-product/:id',(req,res)=>{

  let deleteIds=req.params.id
  productHelpers.deleteProduct(deleteIds).then((data)=>{
    
    res.redirect('/admin/view-products')
  }).catch((err)=>{
    console.log(err)
  })
}) 

//Edit product

router.get('/edit-product/:id',async (req,res)=>{
  let product = await productHelpers.viewProductDetails(req.params.id);
  let categoryDetails = await productHelpers.lookupCategory();
  console.log(product)

  res.render('admin/edit-product',{admin : true ,product, categoryDetails})

})

// Update product

router.post('/update-product/:id',upload.array("image",4),(req,res)=>{

  var filenames = req.files.map(function (files) {
    return files.filename;
  });

  req.body.image = filenames;

  let updateIds=req.params.id
  
  console.log(req.body)

  let prodDetails=req.body
  productHelpers.updateProduct(updateIds,prodDetails).then((data)=>{

    console.log(data)
    res.redirect('/admin/view-products')

  }).catch((err)=>{
    console.log(err)
  })
}) 

  

//Category Management


// View category 

router.get('/view-categories',(req,res)=>{

productHelpers.viewCategory().then((mainCategory)=>{

  res.render('admin/categories',{admin : true, mainCategory})
})


})

// Add category

router.post('/add-maincategory',(req,res)=>{

  
  
  console.log(req.body)


  productHelpers.addCategory(req.body).then((data)=>{

    console.log(data)
    res.redirect('/admin/view-categories')

  })
})

// Add Sub Category

router.post('/add-subcategory',(req,res)=>{

  let newIds= ObjectID(req.body.mainCategory)
  req.body.mainCategory=newIds
  console.log(req.body)
  productHelpers.addSubCategory(req.body).then((data)=>{
    console.log(data)
    res.redirect('/admin/view-categories')
  })

})

// Delete Main Category

// Delete Sub Category

router.get('/edit-subcategories',async (req,res)=>{

  let categoryDetails = await productHelpers.lookupCategory();
  console.log(categoryDetails);

  res.render('admin/edit-category',{admin: true, categoryDetails})

})

router.post('/delete-subcategory',async(req,res)=>{

  deleteIds=req.body.mainCategory
  
  await productHelpers.deleteSubCategory(deleteIds);
  await productHelpers.deleteProducts(deleteIds).then((data)=>{
    console.log(data)
  });
  res.redirect('/admin/edit-subcategories')
  
})

//Orders

router.get('/orders',adminVerify,async (req,res)=>{

  await orderHelpers.getAllOrders().then((orders)=>{
      
    orders=orders.reverse()
    res.render('admin/orders',{admin : true, orders })
    
  })
  

})

//Change orders

router.post('/change-order',async(req,res)=>{
  console.log(req.body)

  await orderHelpers.changeStatus(req.body).then((response)=>{
    console.log(response)
    res.json(response)
  })
})

module.exports = router;
