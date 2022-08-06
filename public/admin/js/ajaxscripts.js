function changeStatus(event,userId,userStatus) {
    event.preventDefault();
    
    $.ajax({
      url: "/admin/blockUser",
      data: {  
        userStatus,
        _id : userId,
      },
      method: "post",
      success: (response) => {
        
        
        console.log(response)
        if (response) {

          document.getElementById(userId).innerHTML="Block"

          console.log("hello")
          location.reload()
          
        } else {

            document.getElementById(userId).innerHTML="Unblock"

            console.log("HI there")
            location.reload()
    
            
        }
      },
    });
}