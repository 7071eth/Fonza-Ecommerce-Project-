function addToCart(event,prodId,userId,count,quantity) {
    event.preventDefault();
    
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
        
        console.log(response)
        if(response.c===1){
          document.getElementById(response.prod).value=q+1
        } else{
          document.getElementById(response.prod).value=q-1
        }

        

        console.log(response)

      },
    });
}