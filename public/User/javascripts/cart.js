//Cart page

function addToCart(event,prodId,userId,count,quantity) {
    event.preventDefault();
    
    
    

    quantity=document.getElementById(prodId).value
    quantity=Number(quantity)
    
    console.log(event,prodId,userId,count,quantity)
    console.log("Hello")
    
    $.ajax({
      url: "/User/add-to-cart",
      data: {
        user: userId,
        product: prodId,   
        count: count,
        quantity: quantity,
      },
      method: "post",
      success: (response) => {


        q=parseInt(document.getElementById(response.prod).value)

        console.log("gotcha")
        response.price=Number(response.price)
        cP=document.getElementById('total').innerHTML
        console.log(cP)
        console.log(response)
        if(response.c===1){
          
          document.getElementById(response.prod).value=q+1
          document.getElementById(response.title).innerHTML=(q+1)*response.price
          document.getElementById('total').innerHTML=Number(document.getElementById('total').innerHTML)+response.price

        } else{

          if(document.getElementById(response.prod).value==1){
            location.reload()
          }
          console.log("Gotcha")
          document.getElementById(response.prod).value=q-1
          document.getElementById(response.title).innerHTML=(q-1)*response.price
          document.getElementById('total').innerHTML=Number(document.getElementById('total').innerHTML)-response.price

        }

        

        console.log(response)

      },
    });
}


//Home page

function addNToCart(event,prodId,userId,count,quantity) {
  event.preventDefault();
  
  
  
  
  console.log(userId)
  quantity=1
  
  

  
  
  console.log(event,prodId,userId,count,quantity)
  console.log("Hello")
  
  $.ajax({
    url: "/User/add-to-cart",
    data: {
      user: userId,
      product: prodId,   
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {


      console.log(response)

      console.log("gotcha")
      document.getElementById('tQuantity').innerHTML=parseInt(document.getElementById('tQuantity').innerHTML)+1
      response.price=parseInt(response.price) 
      
      console.log(document.getElementById('tTotal').innerHTML)
      console.log(response.price)
      if(document.getElementById('tTotal').innerHTML===NaN){

        document.getElementById('tTotal').innerHTML=response.price
        console.log(response)

      } else {
        

        document.getElementById('tTotal').innerHTML=parseInt(document.getElementById('tTotal').innerHTML)+response.price
        console.log(response)
      }
      
      

      

      console.log(response)

    },
  });
}


