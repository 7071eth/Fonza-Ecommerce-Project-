function addToCart(event,prodId,userId,count,quantity) {
    event.preventDefault();
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
        console.log(response)
        if(response.c===1){
          document.getElementById(response.prod).value=q+1
        
          document.getElementById(response.title).innerHTML=(q+1)*response.price
        } else{
          document.getElementById(response.prod).value=q-1
          document.getElementById(response.title).innerHTML=(q-1)*response.price
        }

        

        console.log(response)

      },
    });
}

function subtotal(event,quantity,price,prod){
  event.preventDefault();
  console.log("Hello")
  document.getElementById(prod).innerHTML=document.getElementById(price)*quantity

}