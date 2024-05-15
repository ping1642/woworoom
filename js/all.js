// 代入自己的網址路徑
const api_path = "cping";
const token = "8moYEhkYYjPzoq8WZGYuWtoKVvo2";

let productData = [];
let cartData = [];

//產品及購物車列表初始化
function init(){
    getProductList();
    getCartList();
}

init();

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
        productData = response.data.products;
        renderProductList(productData);
        search(productData);
    })
    .catch(function(error){
        alert(error.response.data);
    })
}

//渲染產品列表
const productWrap = document.querySelector(".productWrap");
function renderProductList(data){
    let str = "";
    data.forEach(function(item){
        let content = 
        `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`;
        str+=content;
    })
    productWrap.innerHTML = str;
}
//下拉式搜尋
const productSelect = document.querySelector(".productSelect");
function search(data){
    productSelect.addEventListener("change",function(e){
        let filterData = [];
        if(e.target.value === "全部"){
            renderProductList(data);
            return;
        }else{
            data.forEach(function(item){
                if(e.target.value === item.category){
                    filterData.push(item);
                }
            })
        }
        renderProductList(filterData);
    })
}


// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
        cartData = response.data.carts;
        renderCartList();
    })
    .catch(function(error){
        alert(error.response.data);
    })
}

// 渲染購物車列表
const shoppingCartTable = document.querySelector(".shoppingCart-table");
function renderCartList(){
    let total = 0;
    let str = "";
    //購物車為空時，刪除鈕隱藏
    if(cartData.length === 0){
        //shoppingCartTable.style.display="none";
        shoppingCartTable.textContent = `購物車是空的？趕快逛起來！！！`;
    }else{
        shoppingCartTable.style.display="revert";
        cartData.forEach(function(item){
            let content = 
                `<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price * item.quantity}</td>
                    <td class="discardBtn">
                    <a href="#" class="material-icons" data-cartId=${item.id}>
                        clear
                    </a>
                    </td>
                </tr>`;
            //總金額加總
            total+= item.product.price * item.quantity;
            str+= content;
        })
        //固定表格
        let cartList =
            `<tr>
                <th width="40%">品項</th>
                <th width="15%">單價</th>
                <th width="15%">數量</th>
                <th width="15%">金額</th>
                <th width="15%"></th>
            </tr>
            ${str}
            <tr>
                <td>
                    <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                    <td>NT$${total}</td>
                </tr>`;
        shoppingCartTable.innerHTML = cartList;
    } 
}

//新增資料邏輯-點擊新增至購物車
function addCart(){
    productWrap.addEventListener("click",function(e){
        e.preventDefault();
        if(e.target.getAttribute("class") !== "addCardBtn"){
            return;
        }else{
            //取得各別產品id
            const productId = e.target.getAttribute("data-id");
            addCartItem(productId);
        }
    })
}
addCart();

// 加入購物車
function addCartItem(id) {
    //購物車產品數量累計
    //如果是新id，quantity = 0 再加1，否則quantity++
    const quantity = (cartData.find((item) => item.product.id === id)?.quantity || 0) + 1;
    //購物車加入特效
    cartEffect();

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        data: {
            "productId": id,
            "quantity": quantity
        }
    })
    .then(function (response) {
        getCartList();
    })
}

// 清除購物車內全部產品
function deleteAllCartList() {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
        getCartList();
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      getCartList();
    })
}

//監聽點擊清除產品
shoppingCartTable.addEventListener("click",function(e){
    e.preventDefault();
    //刪除全部
    if(e.target.getAttribute("class") === "discardAllBtn"){
        //刪除特效
        Swal.fire({
            title: "確定要刪除?",
            text: "一去不復返～",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "刪除",
            cancelButtonText: "取消"
          }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "刪除成功",
                    text: "現在購物車等您補充",
                    icon: "success"
                });
                //刪除全部購物車商品
                deleteAllCartList();
                return;
            }
          });
        
    }
    //刪除特定產品
    if(e.target.getAttribute("class") === "material-icons"){
        //取得所設定的data-cartId屬性值
        let cartId = e.target.getAttribute("data-cartId");
        //特效
        Swal.fire({
            title: "刪除成功",
            icon: "error"
        });
        deleteCartItem(cartId);
    }
    return;
})


// 送出購買訂單
function createOrder(users) {
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": users
      }
    })
    .then(function (response) {
        createOrderEffect();
        getCartList();
    })
    .catch(function(error){
        Swal.fire(error.response.data.message);
    })
}

//客戶訂單資料
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");
const btn = document.querySelector(".orderInfo-btn");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const form = document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll("input[type=text], input[type=tel], input[type=email]"); // 屬性寫法

btn.addEventListener("click",function(e){
    e.preventDefault();
    let userData = {};
    userData.name = customerName.value;
    userData.tel = customerPhone.value;
    userData.email = customerEmail.value;
    userData.address = customerAddress.value;
    userData.payment = tradeWay.value;
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //資料為空跳出提示
    if(userData.name === "" || userData.tel ==="" || userData.email ==="" || userData.address ==="" || userData.payment ===""){
        Swal.fire(`有資料漏填，請再次確認您的資訊`);
        return;
    //email格式錯誤，跳出提示    
    }else if(!emailReg.test(userData.email)){
        Swal.fire(`請輸入正確的Email格式`);
        return;
    }else{
        createOrder(userData);
    }
    form.reset();
})
//表單驗證
// 驗證器條件內容
const constraints = {
    "姓名": {
      presence: {
        message: "必填"
      },
    },
    "電話": {
      presence: {
        message: "必填"
      },
    },
    "Email": {
      presence: {
        message: "必填"
      },
      email: {
        message: "請輸入正確的格式"
      },
    },
    "寄送地址": {
      presence: {
        message: "必填"
      },
    },
}



inputs.forEach((item) => {

  item.addEventListener('change', function(){
    // nextElementSibling 為指定 element 的下一個元素
    // 預設為空值
    item.nextElementSibling.textContent = "";
    
    // 驗證回傳的內容
    let errors = validate(form, constraints);
    // 呈現在畫面上
    if(errors){
      //keys -> 屬性
      Object.keys(errors).forEach(function(item){
        document.querySelector(`.${item}`).textContent = errors[item];
      })
      return false;
    }
    return true;
  })
})

//電話只能是數字
function filterNonNumeric(input) {
    // 過濾非數字字符
    input.value = input.value.replace(/\D/g, '');
}

//購物車加入特效
function cartEffect(){
    const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1300,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
    });
    Toast.fire({
        icon: "success",
        title: "加入成功"
    });
}
//刪除全部購物車商品特效
function createOrderEffect(){
    Swal.fire({
        title: "資料已送出",
        text: "感謝您的訂購",
        icon: "success"
    });
}