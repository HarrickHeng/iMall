let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('../models/goods');
let User = require('../models/user');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/Goods',{useNewUrlParser:true});

mongoose.connection.on("connected",function () {
	console.log("MongoDB数据库成功连接！")
});

mongoose.connection.on("error",function () {
	console.log("MongoDB数据库连接失败！")
});

mongoose.connection.on("disconnected",function () {
	console.log("MongoDB数据库已经断开！")
});

//查询商品列表
router.get("/list",function(req,res,next) {
	//获取参数
	let page = parseInt(req.param("page")) ;
	let pageSize = parseInt(req.param("pageSize"));
	let priceLevel = req.param("priceLevel");
	let sort = req.param("sort");
	let skip = (page-1)*pageSize;
	let params = {};
	
	//设定价格区间
	if (priceLevel!=='all') {
		switch (priceLevel){
		case '0':priceGt = 0;priceLte = 100;
			break;
		case '1':priceGt = 100;priceLte = 500;
			break;
		case '2':priceGt = 500;priceLte = 1000;
			break;		
		case '3':priceGt = 1000;priceLte = 5000;
			break;
	}
		params = {
			productPrice:{
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}
	
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);//跳页查询功能
	goodsModel.sort({'productPrice':sort});//排序依赖
	goodsModel.exec(function(err,doc) {
		if(err) {
			res.json({
				status:'1',
				msg:err.message
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:{
					count:doc.length,
					list:doc
				}
			})
		}
	});
});

//加入购物车
router.post("/addCart",function(req,res,next) {
	let userId = req.cookies.userId;
	let productId = req.body.productId;

	User.findOne({userId:userId},function(err,userDoc) {
		if(err) {
			res.json({
				status:"1",
				msg:err.message
			})
		}else{
			console.log("userDoc:"+userDoc);
			if (userDoc) {
			  let goodsItem = '';
			  userDoc.cartList.forEach(function (item) {
          if (item.productId == productId) {
            goodsItem = item;
            item.productNum++;
          }
        });
			  if (goodsItem) {
          userDoc.save(function (err2,doc) {
            if (err2) {
              res.json({
                status:"1",
                msg:err2.message
              })
            }else{
              res.json({
                status:"0",
                msg:'',
                result:'suc'
              })
            }
          })
        } else {
          Goods.findOne({productId:productId},function(err1,doc) {
            if(err1) {
              res.json({
                status:"1",
                msg:err1.message
              })
            }else{
              if (doc) {
                doc.productNum = 1;
                doc.checked = 1;
                userDoc.cartList.push(doc);
                userDoc.save(function (err2,doc) {
                  if (err2) {
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else{
                    res.json({
                      status:"0",
                      msg:'',
                      result:'suc'
                    })
                  }
                })
              }
            }
          })
        }

			}
		}
	})
})

module.exports = router;
