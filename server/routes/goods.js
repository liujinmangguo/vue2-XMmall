var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/dumall');

mongoose.connection.on("connected", function () {
	console.log('connected success!!!');
});

mongoose.connection.on("error", function () {
	console.log('error!!!');
});

mongoose.connection.on("disconnected", function () {
	console.log('disConnected!!!');
});

router.get('/list', function (req, res, next) {

	//前端时显得接口：http://localhost:3000/goods?page=1&pageSize=8&sort=1
	let page = req.param("page");
	let pageSize = parseInt(req.param('pageSize'));
	let sort = req.param('sort'); //1是升序，-1是降序

	let skip = (page-1) * pageSize;  //分页公式
	let priceLevel = req.param("priceLevel");
	var priceGt = '';
	var priceLte = '';
	let params = {};
	if(priceLevel!='all'){
		switch(priceLevel){
			case '0': priceGt = 0; priceLte = 100; break;
			case '1': priceGt = 100; priceLte = 500; break;
			case '2': priceGt = 500; priceLte = 2000; break;
			case '3': priceGt = 2000; priceLte = 5000; break;
		}
		// 设定条件查询
		params = {
			salePrice:{
				$gt : priceGt,
				$lte : priceLte
			}
			
		}
	}
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);  //分页
	goodsModel.sort({'salePrice': sort});  //排序
	goodsModel.exec(function(err, doc){
		if(err){
			res.json({
				status: "1",
				msg: err.message
			})
		}else{
			res.json({
				status: "0",
				msg: "",
				result: {
					count: doc.length,
					list: doc
				}
			});
		}
	});

	// //普通查询9-3之前
	// Goods.find({}, function(err, doc){
	// 	if(err){
	// 		res.json({
	// 			status: "1",
	// 			msg: err.message
	// 		})
	// 	}else{
	// 		res.json({
	// 			status: "0",
	// 			msg: "",
	// 			result: {
	// 				count: doc.length,
	// 				list: doc
	// 			}
	// 		});
	// 	}
	// })
});

//加入到购物车
router.post("/addCart", function (req,res,next) {
  var userId = req.cookies.userId,productId = req.body.productId;
  var User = require('../models/user');
  User.findOne({userId:userId}, function (err,userDoc) {
    if(err){
        res.json({
            status:"1",
            msg:err.message
        })
    }else{
        console.log("userDoc:"+userDoc);
        if(userDoc){
          var goodsItem = '';
          userDoc.cartList.forEach(function (item) {
              if(item.productId == productId){
                goodsItem = item;
                item.productNum ++;
              }
          });
          if(goodsItem){
            userDoc.save(function (err2,doc2) {
              if(err2){
                res.json({
                  status:"1",
                  msg:err2.message
                })
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
                })
              }
            })
          }else{
            Goods.findOne({productId:productId}, function (err1,doc) {
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                })
              }else{
                if(doc){
                  doc.productNum = 1;
                  doc.checked = 1;
                  userDoc.cartList.push(doc);
                  userDoc.save(function (err2,doc2) {
                    if(err2){
                      res.json({
                        status:"1",
                        msg:err2.message
                      })
                    }else{
                      res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                      })
                    }
                  })
                }
              }
            });
          }
        }
    }
  })
});

module.exports = router;