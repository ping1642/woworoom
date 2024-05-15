// 代入自己的網址路徑
const api_path = "cping";
const token = "8moYEhkYYjPzoq8WZGYuWtoKVvo2";
//所有客戶訂單資料
let orderListData = [];
//客戶所訂的訂單品項完整資料
let orderProductData = [];
//客戶所訂的訂單細部品項資料
let orderTitleList = [];

// 取得訂單列表
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
        orderListData = response.data.orders;
        //渲染訂單列表
        renderOrderList();
        //品項list
        orderProductList();
        //刪除鍵
        delBtn();
    })
}
getOrderList();

//渲染訂單列表
const orderTable = document.querySelector(".orderPage-table");
function renderOrderList(){
    let str = "";
    //訂單list
    orderListData.forEach(function(item){
        //訂單日期(年/月/日)
        const createdAtTimestampInMillis = item.createdAt * 1000;
        const createdAtDate = new Date(createdAtTimestampInMillis);
        const year = createdAtDate.getFullYear();
        const month = String(createdAtDate.getMonth() + 1).padStart(2, '0'); // 月份是從 0 開始的，因此需要加 1
        const day = String(createdAtDate.getDate()).padStart(2, '0');
        //客戶所訂的訂單品項完整資料
        orderProductData = item.products;
        let productStr = "";
        orderProductData.forEach(function(product){
            let productContent = `<p>${product.title}＊${product.quantity}</p>`;
            productStr += productContent;
        })
        //組陣列資料呈現畫面
        let content = 
        `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${year}/${month}/${day}</td>
            <td class="orderStatus">
                <a href="#" data-paidId=${item.id}>${item.paid === true? "已處理" : "未處理"}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" data-orderId=${item.id} value="刪除">
            </td>
        </tr>`;
        str += content;
    })
    //固定列表
    let orderList = 
    `<thead>
        <tr>
            <th>訂單編號</th>
            <th>聯絡人</th>
            <th>聯絡地址</th>
            <th>電子郵件</th>
            <th>訂單品項</th>
            <th>訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
        </tr>
        ${str}
    </thead>`;
    //畫面呈現
    orderTable.innerHTML = orderList;
    //訂單狀態鍵及刪除特定訂單
    //orderBtn();
    
}

//監聽點擊客戶訂單list
function orderBtn(){
    orderTable.addEventListener("click",function(e){
        e.preventDefault();
        orderListData.forEach(function(item){
            //改變訂單狀態
            //取得所設定的data-paidId屬性值
            let paidId = e.target.getAttribute("data-paidId");
            if(paidId === item.id){
                //取得現在訂單的狀態
                let paidStatus = item.paid;
                //點擊過後狀態要改變(!paidStatus)
                editOrderList(paidId,!paidStatus);
            }
            //刪除特定訂單
            let delOrderId = e.target.getAttribute("data-orderId");
            if(delOrderId === item.id){
                deleteOrderItem(delOrderId);
            }
        })
        return;
    })
}
orderBtn();

// 修改訂單狀態
function editOrderList(orderId,status) {
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": status
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      getOrderList();
    })
}


// 刪除特定訂單
function deleteOrderItem(orderId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
        headers: {
          'Authorization': token
        }
    })
    .then(function (response) {
        getOrderList();
    })
}

// 刪除全部訂單
function deleteAllOrder() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
        getOrderList();
    })
    .catch(function(error){
        alert(error.response.data.message);
    })
}

// 監聽點擊刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    deleteAllOrder();
})

//刪除鍵隱藏
function delBtn(){
    if(orderListData.length === 0){
        discardAllBtn.style.display="none";
        alert(`目前無訂單資料！！！`);
    }else{
        discardAllBtn.style.display="revert";
    }
    
}

//品項list
function orderProductList(){
    //品項資料收集
    let newArr = [];
    //品項相對應數量收集
    let countArr = [];
    orderListData.forEach(function(item){
        orderTitleList = item.products;
        orderTitleList.forEach(function(item){
            newArr.push(item.title);
            countArr.push(item.quantity);
        })
    })
    //將品項及各別數量進行加總
    let result = countOccurrences(newArr,countArr);
    //將品項數量計算過後用成陣列包陣列的模式
    arrCount(result)
}

//計算品項數量加總
function countOccurrences(arr,quantity) {
    let name = {};
    // 計數資料
    arr.forEach(function(item,index){
        let count = quantity[index]
        name[item] = (name[item] || 0) + count;
    })
    // 將計數轉換為陣列並按照計數降序排序
    let countedArray = Object.entries(name).sort((a, b) => b[1] - a[1]);

    // 用物件將資料包住
    let newObj = {};
    // 品項,加總數量,排名
    let rankedArray = countedArray.map((entry, index) => ({ data: entry[0], count: entry[1], rank: index + 1 }));
    let total = 0;
    rankedArray.forEach(function(item){
        //前三名品項
        if(item.rank <= 3){
            newObj[item.data] = item.count;
        }
        //不到前三名的品項數量加總
        if(item.rank > 3){
            total += item.count;
            newObj["其他"] = total;
        }

    })
    return newObj;
    
}
//將物件資料轉為陣列包陣列
function arrCount(count){
    let key = Object.keys(count);
    let newData = [];
    key.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(count[item]);
        newData.push(ary);
    })
    //將組好的資料丟入c3套件
    chartGraph(newData);
}

// C3.js
function chartGraph(list){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: list,
        },
    });
}
