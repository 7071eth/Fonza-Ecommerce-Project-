function changeQuantity(cartId, proId, count,dummy) {
    event.preventDefault();
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    $.ajax({
      url: "/change-product-quantity",
      data: {
        cart: cartId,
        product: proId,   
        count: count,
        quantity: quantity,
      },
      method: "post",
      success: (response) => {
        if (response.removeProduct) {
          alert("Product Removed from cart");
          location.reload();
        } else {
          document.getElementById(proId).innerHTML = quantity + count;
          document.getElementById("total").innerHTML = response.total;
        }
      },
    });
}