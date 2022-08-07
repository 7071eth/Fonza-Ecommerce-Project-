function addToCart(event,prodId,userId) {
    event.preventDefault();
    
    console.log(event,prodId,userId)
    $.ajax({
      url: "/User/add-to-cart",
      data: {
        user: userId,
        product: prodId,   
        count: 1,
        quantity: 1,
      },
      method: "post",
      success: (response) => {

        console.log(response)

      },
    });
}