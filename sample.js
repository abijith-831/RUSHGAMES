// let n = 15;
// let res= []
// for(let i=1;i<=n;i++){
//     if(i%3===0&&i%5===0){
//         res.push('fizzbuzz')
//     }
//     else if(i%3===0){
//         res.push('fiz')
//     }
//    else if(i%5===0){
//         res.push('buzz')
//     }else{
        
//         res.push(i.toString())
//     }
// }
// console.log(res);
// let  s = "Hello";
// let small = s.toLowerCase()
// console.log(small);
// let str = 'my name is shabeen'
// let arr = str.split(' ')
// console.log(arr);
// let nums = [1,15,6,3]
// let sum1 = nums.reduce((acc,curr)=>{
//     return acc + curr; 
// },0)
// let sum2 = []
// for(let i=0;i<nums.length;i++ ){
//     if(nums[i]>=10){
//         let f = Math.floor(nums[i]/10)
//         let s = nums[i]%10
//         sum2.push(f,s)
        
//     }else{
//         sum2.push(nums[i])
//     }
// }
// console.log(sum2);

// var a = 20 ;
// a = a+10;

// var arr = [1,2,3,4]
// arr.push(5)

// var obj = {
//     a:10,
//     b:20
// }
// obj.a = 30;


//[1,2,4,5,7,6,6]
// for(let i=0;i<arr.length;i++){
//     arr[i].toString().split('')
// }


// let res = arr.map((item)=>{
//     if(item>10){
//        let str = item.toString().split('')
//        sum = 0
//        for(let i=0;i<str.length;i++){
//             sum += parseInt(str[i])
            
//        }
       
//        return sum
//     }else{
//         return item
//     }
// })
// console.log(res);

// let n = 234;
// let str = n.toString().split('')
// console.log(str);

// let arr= []
// for(let i=0;i<num;i++){
//     if(i<10&&i%2==0){
//         arr.push(i)
//     }else{
//         let f = Math.floor(i/10)
//         let s = i%10
//         if((f+s)%2==0){
//             arr.push(i)
//         }
//     }
// }
// console.log(arr);
// let num = 28
// let arr= []
//     for(let i=0;i<num;i++){
//         if(num%i==0){
//             arr.push(i)
//         }
//     }
//     console.log(arr);

// let a = '123'
// let b = 45
// let c= a+b
// console.log(typeof(c));

// let a = '123'
// let b = Number(a)
// console.log(typeof(b));
// let nums = [7,7,5,5,6,6,1,1,1]
// let sort = nums.sort()
//     console.log(sort[Math.floor(sort.length/2)]) 
// let num = 12345;
// let str = Array.from(String(num),Number)
// console.log(str);
// let num = 12345
// let a = num.toString().split('')

// let nums = [1,2,0]
// let sort = nums.sort((a,b)=>a-b)
// console.log(sort);
// let max = sort[sort.length-1]+1
// console.log(max);
// for(let i = 1 ; i<=max;i++){
//     if(sort[i]>=1){
//         if(sort[i]!==i){
//             console.log(i);
            
//         }
//     }
// }
// let nums1 = [1,2,3,0,0,0]
// let nums2 = [2,5,6]
// let arr = [...nums1,...nums2].sort()
// let out = []
// for(let i=0;i<arr.length;i++){
//     if(arr[i]!==0){
//         out.push(arr[i])
//     }
// }
//    console.log(out);
// let num = 14
// for(let i=1;i<=num;i++){
//     if(i*i==num){
//         console.log('true');
//     }
// }
// const sortProducts = async (req, res) => {
//     try {
//       const { criteria } = req.params;
//       let productData;
//       switch (criteria) {
//         case 'nameAZ':
//           productData = await Products.find().collation({ locale: "en" }).sort({ name: 1 });
//           break;
//         case 'nameZA':
//           productData = await Products.find().collation({ locale: "en" }).sort({ name: -1 });
//           break;
//         case 'newArrivals':
//           productData = await Products.find().sort({ createdAt: -1 });
//           break;
//         case 'priceLowToHigh':
//           productData = await Products.find().sort({ price: 1 });
//           break;
//         case 'priceHighToLow':
//           productData = await Products.find().sort({ price: -1 });
//           break;
//         default:
//           res.status(400).json({ error: 'Invalid sorting criteria' });
//           return;
//       }
  
      
//         const newLabelCountownDays = 3;
//         const modifiedProductData = productData.map((product) => {
//         const isOutOfStock = product.quantity === 0;
//         const createdAt = new Date(product.createdAt);
//         const today = new Date();
//         const daysDifference = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
//         const isNew = daysDifference <= newLabelCountownDays && !isOutOfStock;
  
//         return {
//           ...product.toObject(),
//           outOfStock: isOutOfStock,
//           isNew,
//         };
//       });
  
 
//       res.json({ productData: modifiedProductData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };


//   <%-include('../layouts/header')  %>
 

//     <!-- Breadcrumb Begin -->
//     <div class="breadcrumb-option">
//         <div class="container">
//             <div class="row">
//                 <div class="col-lg-12">
//                     <div class="breadcrumb__links">
//                         <a href="/"><i class="fa fa-home"></i> Home</a>
//                         <span>Shop</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
//     <!-- Breadcrumb End -->

//     <!-- Shop Section Begin -->
//     <section class="shop spad">
//         <div class="container">
//             <div class="row">
//                 <div class="col-lg-3 col-md-3">
//                     <div class="shop__sidebar">
//                         <div class="sidebar__categories">
//                             <div class="section-title">
//                                 <h4>Categories</h4>
//                             </div>
//                             <div class="categories__accordion">
//                                 <div class="accordion" id="accordionExample">
//                                     <% categories.forEach(category => { %>
//                                         <div class="card">
//                                             <div class="card-heading">
//                                                 <a  data-target="#<%= category._id %>"><%= category.name %></a>
//                                             </div>
//                                             <div id="<%= category._id %>" class="collapse" data-parent="#accordionExample">
//                                                 <div class="card-body">
//                                                     <ul>
//                                                         <% if (category.subcategories && category.subcategories.length) { %>
//                                                             <% category.subcategories.forEach(subcategory => { %>
//                                                                 <li><a href="#"><%= subcategory.name %></a></li>
//                                                             <% }); %>
//                                                         <% } else { %>
//                                                             <li>No subcategories available</li>
//                                                         <% } %>
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     <% }); %>
//                                 </div>
//                             </div>
//                         </div>
                        
//                          <div class="sidebar__filter">
//                             <div class="section-title">
//                                 <h4>Shop by price</h4>
//                             </div>
//                             <div class="filter-range-wrap">
//                                 <div class="price-range ui-slider ui-corner-all ui-slider-horizontal ui-widget ui-widget-content"
//                                 data-min="33" data-max="99"></div>
//                                 <div class="range-slider">
//                                     <div class="price-input">
//                                         <p>Price:</p>
//                                         <input type="text" id="minamount">
//                                         <input type="text" id="maxamount">
//                                     </div>
//                                 </div>
//                             </div>
//                             <a href="#">Filter</a>
//                         </div> -->
//                         <div class="sidebar__sizes">
//                             <div class="section-title">
//                                 <h4>Shop by size</h4>
//                             </div>
//                             <div class="size__list">
//                                 <label for="sizeS">
//                                     s
//                                     <input type="checkbox" id="sizeS">
//                                     <span class="checkmark"></span>
//                                 </label>
//                                 <label for="sizeM">
//                                     m
//                                     <input type="checkbox" id="sizeM">
//                                     <span class="checkmark"></span>
//                                 </label>
//                                 <label for="sizeL">
//                                     l
//                                     <input type="checkbox" id="sizeL">
//                                     <span class="checkmark"></span>
//                                 </label>
                                
                               
//                             </div>
//                         </div>
//                         <div class="sidebar__sizes">
//                             <div class="section-title">
//                                 <h4>Shop by </h4>
//                             </div>
//                             <div class="size__list">
//                                 <label for="nameAZ">
//                                     name (a-z)
//                                     <input type="checkbox" id="nameAZ">
//                                     <span class="checkmark"></span>
//                                 </label>
//                                 <label for="nameZA">
//                                     name (z-a)
//                                     <input type="checkbox" id="nameZA">
//                                     <span class="checkmark"></span>
//                                 </label>
//                                 <label for="newArrivals">
//                                     new arrivals
//                                     <input type="checkbox" id="newArrivals">
//                                     <span class="checkmark"></span>
//                                 </label>
                               
//                                 <label for="priceLowToHigh">
//                                     price : low to high
//                                     <input type="checkbox" id="priceLowToHigh">
//                                     <span class="checkmark"></span>
//                                 </label>
//                                 <label for="priceHighToLow">
//                                     price : high to low 
//                                     <input type="checkbox" id="priceHighToLow">
//                                     <span class="checkmark"></span>
//                                 </label>
                               
//                             </div>
//                         </div>
                       
//                     </div>
//                 </div>
                
//                 <div class="col-lg-9 col-md-9">
//                     <div class="row" id="productList">
//                         <% productData.forEach(product => { %>
//                             <div class="col-lg-4 col-md-6">
//                                 <div class="product__item">
//                                     <div class="product_item_pic" style="display: flex; justify-content: center; align-items: center;">
//                                         <a href="/productDetails/<%= product._id %>">
//                                             <img src="/uploads/products/<%= product.mainImage %>" alt="<%= product.name %>" style="max-width: 100%; max-height: 100%; object-fit: contain;">
//                                         </a>
//                                         <% if (product.quantity == 0) { %>
//                                             <div class="label out-of-stock" style="background-color: black; color: white;width: 110px; height: 20px;">Out of Stock</div>
//                                         <% } else if (product.isNew) { %>
//                                             <div class="label new" style="background-color: #36a300;width: 50px; height: 20px;">New</div>
//                                         <% } %>
//                                         <ul class="product__hover">
//                                             <li><a href="/uploads/products/<%= product.mainImage[0] %>" class="image-popup"><span class="arrow_expand"></span></a></li>
//                                             <li><a href="/wishlist"><span class="icon_heart_alt"></span></a></li>
//                                             <% if (product.quantity > 0) { %>
//                                                 <li><a href="/addToCart?productId=<%= product._id %>"><span class="icon_bag_alt"></span></a></li>
//                                             <% } else { %>
                                             
//                                                 <li><span class="icon_bag_alt_disabled"></span></li>
//                                             <% } %>
//                                         </ul>
                                        
//                                     </div>
//                                     <div class="product_item_text">
//                                         <h6><a href="/productDetails/<%= product._id %>"><%= product.name %></a></h6>
//                                         <div class="rating">
//                                             <i class="fa fa-star"></i>
//                                             <i class="fa fa-star"></i>
//                                             <i class="fa fa-star"></i>
//                                             <i class="fa fa-star"></i>
//                                             <i class="fa fa-star"></i>
//                                         </div>
//                                         <div class="product__price">₹ <%= product.price %></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         <% }) %>
//                     </div>
//                     <div class="col-lg-12 text-center">
//                         <div class="pagination__option">
//                             <a href="#">1</a>
//                             <a href="#">2</a>
//                             <a href="#">3</a>
//                             <a href="#"><i class="fa fa-angle-right"></i></a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </section>
//     <!-- Shop Section End -->

// <%-include('../layouts/footer')  %>
// <script>
//     // Add event listener for sorting checkboxes
// document.addEventListener('DOMContentLoaded', function () {
//     const checkboxes = document.querySelectorAll('.sidebar__sizes input[type="checkbox"]');
//     checkboxes.forEach(checkbox => {
//         checkbox.addEventListener('change', function () {
//             // Log the checkbox ID to ensure the event listener is triggered
//             console.log('Checkbox ID:', checkbox.id);

//             const criteria = checkbox.id;
//             fetch(/sort/${criteria}, { method: 'GET' })
//                 .then(response => response.json())
//                 .then(data => {
//                     // Log the fetched data to ensure it is received correctly
//                     console.log('Fetched Data:', data);
//                     updateProductList(data.productData);
//                 })
//                 .catch(error => {
//                     console.error('Error:', error);
//                 });
//         });
//     });
// });

// function updateProductList(productData) {
//     const productList = document.getElementById('productList');
//     productList.innerHTML = '';

//     productData.forEach(product => {
//         const outOfStockLabel = product.quantity === 0 ? '<div class="label out-of-stock" style="background-color: black; color: white;width: 110px; height: 20px;">Out of Stock</div>' : '';
//         const newLabel = product.isNew ? '<div class="label new" style="background-color: #36a300;width: 50px; height: 20px;">New</div>' : '';

//         const productItem = `
//             <div class="col-lg-4 col-md-6">
//                 <div class="product__item">
//                     <div class="product_item_pic" style="display: flex; justify-content: center; align-items: center;">
//                         <a href="/productDetails/${product._id}">
//                             <img src="/uploads/products/${product.mainImage}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
//                         </a>
//                         ${outOfStockLabel}
//                         ${newLabel}
//                         <ul class="product__hover">
//                             <li><a href="/uploads/products/${product.mainImage}" class="image-popup"><span class="arrow_expand"></span></a></li>
//                             <li><a href="/wishlist"><span class="icon_heart_alt"></span></a></li>
//                             ${product.quantity > 0 ? <li><a href="/addToCart?productId=${product._id}"><span class="icon_bag_alt"></span></a></li> : '<li><span class="icon_bag_alt_disabled"></span></li>'}
//                         </ul>
//                     </div>
//                     <div class="product_item_text">
//                         <h6><a href="/productDetails/${product._id}">${product.name}</a></h6>
//                         <div class="rating">
//                             <i class="fa fa-star"></i>
//                             <i class="fa fa-star"></i>
//                             <i class="fa fa-star"></i>
//                             <i class="fa fa-star"></i>
//                             <i class="fa fa-star"></i>
//                         </div>
//                         <div class="product__price">₹ ${product.price}</div>
//                     </div>
//                 </div>
//             </div>
//         `;
//         productList.insertAdjacentHTML('beforeend', productItem);
//     });
// }


// </script>

// const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
//                 let paymentMethod = null;

//                 paymentRadios.forEach((radio) => {
//                     radio.addEventListener('click', (event) => {
//                         paymentMethod = event.target.value;
//                         console.log('Selected Payment Method:', paymentMethod);
//                     });
//                 });




//                 // Address selection
//                 const checkboxes = document.querySelectorAll('.select-address');
//                 let addressId = null;

//                 checkboxes.forEach((checkbox) => {
//                     checkbox.addEventListener('change', (event) => {
//                         if (event.target.checked) {
//                             addressId = event.target.value;
//                             console.log('Selected Address ID:', addressId);
//                             console.log(totalAmount, 'ajg');
//                         }
//                     });
//                 });



//                 document.addEventListener('DOMContentLoaded', () => {

//                     var amountSpan = document.querySelector('#amount span');
//                     var totalAmountText = amountSpan.textContent.trim();
//                     var totalAmount = parseFloat(totalAmountText.replace('₹', ''));
    
//                     function proceedToCheckout(paymentMethod, addressId) {
//                         fetch('/orderproduct', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json'
//                             },
//                             body: JSON.stringify({ paymentMethod, addressId,totalAmount })
//                         })
//                             .then(response => response.json())
//                             .then(data => {
//                                 if (data.success) {
    
//                                     window.location.href = '/order'
    
//                                 } else {
    
//                                     Swal.fire({
//                                         icon: 'error',
//                                         title: 'Error',
//                                         text: 'Products is out of Stock, please remove product',
//                                         showConfirmButton: false, // Disable the confirm button
//                                         timer: 2000, // Display the alert for 3 seconds
//                                         timerProgressBar: true
    
//                                     })
//                                 }
//                             })
    
//                             .catch(error => {
//                                 console.error('Fetch error:', error);
//                                 // Handle fetch error
//                             });
//                     }
    
//                     function razorPay(paymentMethod, addressId, totalAmount) {
//                         console.log(totalAmount,'dhas');
//                         let totalAmountInPaise = totalAmount * 100;
    
    
//                         fetch('/razor', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json'
//                             },
//                             body: JSON.stringify({ totalAmountInPaise })
//                         })
//                             .then(res => res.json())
//                             .then(data => {
//                                 console.log('Data from server:', data);
//                                 if (data.succes) {
//                                     console.log('resopnse reached');
//                                     let options = {
//                                         "key": ${data.key_id},
//                                         "amount": ${data.amount},
//                                         "currency": "INR",
//                                         "name": "Zakio",
//                                         "order_id": ${data.orderid},
//                                         "handler": function (response) {
    
//                                             proceedToCheckout(paymentMethod, addressId);
//                                         },
//                                         "profile": {
//                                             "name": ${data.name},
//                                             "email": ${data.email}
//                                         }
//                                     }
    
//                                     let razorpayObject = new Razorpay(options);
//                                     razorpayObject.on('payment.failed', (response) => {
//                                         alert('payment failed');
//                                     })
//                                     razorpayObject.open();
    
//                                 }
//                             })
//                     }
    
//                     //document.addEventListener('DOMContentLoaded', () => {
//                     // Payment method
//                     const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
//                     let paymentMethod = null;
    
//                     paymentRadios.forEach((radio) => {
//                         radio.addEventListener('click', (event) => {
//                             paymentMethod = event.target.value;
//                             console.log('Selected Payment Method:', paymentMethod);
//                         });
//                     });
    
    
    
    
//                     // Address selection
//                     const checkboxes = document.querySelectorAll('.select-address');
//                     let addressId = null;
    
//                     checkboxes.forEach((checkbox) => {
//                         checkbox.addEventListener('change', (event) => {
//                             if (event.target.checked) {
//                                 addressId = event.target.value;
//                                 console.log('Selected Address ID:', addressId);
//                                 console.log(totalAmount, 'ajg');
//                             }
//                         });
//                     });
    
    
    
    
//                     // Proceed to Paypal button click handler
//                     const orderButton = document.querySelector('.btn_3');
//                     orderButton.addEventListener('click', () => {
//                         if (paymentMethod && addressId) {
//                             console.log('Proceeding to Paypal with:');
//                             console.log('Selected Payment Method:', paymentMethod);
//                             console.log('Selected Address ID:', addressId);
    
//                             // Call the proceedToCheckout function with paymentMethod and addressId
//                             if (paymentMethod == 'razorPay') {
    
//                                 razorPay(paymentMethod, addressId, totalAmount)
    
//                             } else {
//                                 proceedToCheckout(paymentMethod, addressId);
//                             }
    
//                         } else {
//                             console.log('Please select both Payment Method and Address');
//                         }
//                     });
//                 });

const LoadOrderDatails = async(req,res)=> {

    try {

        const userid = req.session.user_id;
        const userdata = await User.findOne({_id:userid})

        const orderdata = await Order.find({userId:userid}).populate('items.productId')

        res.render('userOrderDetailsPage',{userdata:userdata,orderDatas:orderdata})
        
    } catch (error) {
        console.log(error.message);
    }

}

<div class="col-md-8 order-det">
                    <div class="card">
                        <h5 class="h5hed">Your Orders</h5>
                        <hr>

                        <div class="card-body">
                            <% if(orderDatas.length> 0){ %>


                                <% orderDatas.forEach(i=> { %>


                                    <div class="col-md-12"
                                        style="margin-top: -15px; display: flex; align-items: center; justify-content: space-between;">
                                        <p style=" margin: 0;">#Order ID: <span style="color: red;">
                                                <%= i.orderId %>
                                            </span> | Order On <%= i.currendDate.toLocaleDateString('en-US', {
                                                day: 'numeric' , month: 'short' , year: 'numeric' }) %>
                                        </p>
                                        <a href="/singleOrderDetails?id=<%= i.orderId %>"><button style="height: 35px;"
                                                class="btn btn-success p-1">View Order Details</button></a>
                                    </div>

                                    <hr>
                                    <% if(i.items.length> 0){ %>
                                        <% i.items.forEach(product=> { %>

                                            <div class="col-md-12">

                                                <div class="row">
                                                    <div style="width: 80px;  ">
                                                        <img src="<%= product.productId.image[0] %>" alt="fsdfdff"
                                                            style="width: 80px; height: 80px;">
                                                    </div>
                                                    <div style="margin-left: 30px; width: 170px;">
                                                        <br>
                                                        <p style="font-size: 20px; font-weight: 500;">
                                                            <%= product.productId.pname %>
                                                        </p>
                                                    </div>
                                                    <div style="margin-left: 25px;">
                                                        <p>Price</p>
                                                        <p style="font-size: 16px; font-weight: 500;">₹<%= product.price
                                                                %>
                                                        </p>
                                                    </div>

                                                    <div style="margin-left: 90px;">
                                                        <p>QTY</p>
                                                        <p style="font-size: 16px; font-weight: 500;">
                                                            <%= product.quantity %>
                                                        </p>
                                                    </div>
                                                    <div style="margin-left: 70px;">

                                                        <p>Status</p>
                                                        <p
                                                            style="font-size: 16px; font-weight: 500; color: rgb(9, 117, 9);">
                                                            <%= product.Status %>
                                                        </p>
                                                    </div>
                                                   

                                                </div>
                                                <hr>
                                            </div>
                                            <br>
                                            <% }) %>
                                                <% } %>


                                                    <% }); %>
                                                        <% } %>
                        </div>
                    </div>
                </div>