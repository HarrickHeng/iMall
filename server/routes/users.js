var express = require('express');
var router = express.Router();
require('../util/util')
let User = require('../models/user');

//登陆接口
router.post('/login', function(req, res, next) {
  var param = {
   userName:req.body.userName,
    userPwd:req.body.userPwd
  };

  User.findOne(param,function (err,doc) {
    if (err) {
      res.json({
        status:"1",
        msg:err.message
      });
    }else {
      if (doc){
        res.cookie("userId",doc.userId,{
          path:'/',
          maxAge:1000*60*60
        });
        res.cookie("userName",doc.userName,{
          path:'/',
          maxAge:1000*60*60
        });
        // req.session.user = doc;
        res.json({
          status: "0",
          msg:'',
          result:{
            userName:doc.userName
          }
        })
      }else{
        res.json({
          status:"1",
          msg:''
        });
      }
    }
  })
});

//登出接口
router.post("/logout",function (req,res,next) {
  res.cookie("userId","",{
    path: "/",
    maxAge: -1
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});

//检查登陆
router.get("/checkLogin",function (req,res,next) {
  if (req.cookies.userId) {
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    });
  } else {
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});

//计算购物车商品数量
router.get("/getCartCount",function (req,res,next) {
  if (req.cookies && req.cookies.userId){
    let userId = req.cookies.userId;
    User.findOne({userId:userId},function (err,doc) {
      if (err) {
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else {
        let cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(function (item) {
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status:'0',
          msg:'',
          result:cartCount
        });
      }
    })
  }
});

//查询用户购物车数据
router.get("/cartList",function (req,res,next) {
  let userId = req.cookies.userId;
  User.findOne({userId:userId},function (err,doc) {
    if (err) {
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    } else {
      if (doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.cartList
        });
      }
    }
  });
});

//删除购物车
router.post("/cart/del",function (req,res,next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  User.update({userId: userId}, {$pull: {'cartList': {'productId': productId}}}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '删除成功',
        result:''
      });
    }
  });
});

//购物车修改商品数量
router.post("/cartEdit",function (req,res,next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  User.update({"userId": userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  },function (err,doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      });
    }
  })
});

//全选购物车
router.post("/editCheckAll",function (req,res,next) {
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId: userId},function (err,user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      if (user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        });
        user.save(function (err1,doc) {
          if (err1){
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            });
          }
        })
      }
    }
  })
});

//查询用户接口地址
router.get("/addressList",function (req,res,next) {
  let userId = req.cookies.userId;
  User.findOne({userId:userId},function (err,doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status: '0',
        msg:'',
        result: doc.addressList
      });
    }
  })
});

//设置默认地址
router.post("/setDefault",function (req,res,next) {
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status: '1',
      msg: 'addressId is null',
      result: ''
    });
  }else {
    User.findOne({userId:userId},function (err,doc) {
      if (err){
        res.json({
          status: '10003',
          msg: err.message,
          result: ''
        });
      } else {
        let addressList = doc.addressList;
        addressList.forEach((item)=>{
          if (item.addressId==addressId) {
            item.isDefault = true;
            var indexA = addressList.indexOf(item);
          } else {
            item.isDefault = false;
          }
          //将默认地址放在名单首位
          function swapArr(arr,index1,index2) {
            arr[index1] = arr.splice(index2,1,arr[index1])[0];
            return arr;
          }
          swapArr(addressList,0,indexA);
        });
        doc.save(function (err1,doc1) {
          if (err1){
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          } else {
            res.json({
              status:'0',
              msg: '',
              result: ''
            });
          }
        });
      }
    })
  }
});

//删除订单地址
router.post("/delAddress",function (req,res,next) {
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  User.update({userId:userId},{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  },function (err,doc) {
    if (err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      res.json({
        status:'0',
        msg: '',
        result: ''
      });
    }
  })
});

//创建订单
router.post("/payment",function (req,res,next) {
  let userId = req.cookies.userId;
  let orderTotal = req.body.orderTotal;
  let addressId = req.body.addressId;
  User.findOne({userId:userId},function (err,doc) {
    if (err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      });
    } else {
      let address = '';
      let goodsList =[];
      //获取当前用户的地址信息
      doc.addressList.forEach((item)=>{
        if (addressId==item.addressId) {
          address = item;
        }
      });
      //获取用户购物车的购买商品
      doc.cartList.filter((item)=>{
        if (item.checked=='1'){
          goodsList.push(item);
        }
      });
      //创建订单号
      let platform = '122';
      let r1 = Math.floor(Math.random()*10);
      let r2 = Math.floor(Math.random()*10);

      let sysDate = new Date().Format('yyyyMMddhhmmss');
      let creatDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      let orderId = platform+r1+sysDate+r2;

      let order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:creatDate
      };

      doc.orderList.push(order);
      doc.save(function (err1,doc1) {
        if (err1){
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          });
        }else {
          res.json({
            status: '0',
            msg: '',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          });
        }
      });
    }
  })
});

//根据订单ID查询订单信息
router.get("/orderDetail",function (req,res,next) {
  let userId = req.cookies.userId;
  let orderId = req.param("orderId");
  User.findOne({userId:userId},function (err,userInfo) {
    if (err) {
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    } else {
      let orderList = userInfo.orderList;
      let orderTotal = 0;
      if (orderList.length>0) {
         orderList.forEach((item)=>{
           if (item.orderId==orderId) {
             orderTotal = item.orderTotal;
           }
         });
         if (orderTotal>0){
           res.json({
             status:'0',
             msg:'',
             result:{
               orderId:orderId,
               orderTotal:orderTotal
             }
           })
         } else {
           res.json({
             status:'120002',
             msg:'订单未查询',
             result:''
           });
         }
      } else {
        res.json({
          status:'120001',
          msg:'订单不存在',
          result:''
        })
      }
    }
  })
});
module.exports = router;
