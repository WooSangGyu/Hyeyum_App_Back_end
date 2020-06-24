var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var resCode = require('../resCode/codes');
const models = require('../models');
var secretObj = require('../config/jwt');
var verify = require('../config/verify');


router.use(cookieParser('asdgihasodghoasdg'));


router.get('/community', function(req, res, next) {

  models.community.findAll()
  .then( result => {
    console.log("게시판 호출 완료");
    res.json({
              resultCode : resCode.Success,
              message: resCode.SuccessMessage 
    })
  })
  .catch( err => {
    console.log("게시판 호출 실패");
    res.json({
      resultCode : resCode.Failed,
      message : resCode.ReadError
    })
  })
});

router.post('/community/createpost', function(req, res, next) {

  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }

  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;
    let body = req. body;

    models.community.create({
      writer : loginuser,
      title : body.title,
      content : body.content,
      createTime : new Date()
    })
    .then(result => {
      console.log("게시글 작성 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err => {
      console.log("게시글 작성 실패");
      console.log(err);
      res.json({
        resultCode : resCode.Failed,
        message : resCode.CreateError
    });
    })
  }
  else {
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});

router.put('/community/updatepost', function(req, res, next) {
  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }
  
  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;
    let body = req.body;

    models.community.update({
      title: body.title,
      writer: body.writer
    }, {
        where: { id: loginuser , no : body.no }
    })
    .then( result => {
      console.log("게시글 수정 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err => {
      console.log("게시글 수정 실패");
      console.log(err);
      res.json({ resultCode : resCode.Failed,
                 message: resCode.UpdateError
      });
    });
  }
  else{
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});

router.delete('/community/deletepost', function(req, res, next) {
  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }
  
  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;
    let body = req.body;

    models.community.destroy({
      where: {id : loginuser , no : body.no }
    })
    .then( result => {
      console.log("게시글 삭제 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err =>{
      console.log("게시글 삭제에 실패했습니다.");
      console.log(err);
      res.json({ resultCode : resCode.Failed,
                 message: resCode.DeleteError });
    });
  }
  else{
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});


router.post('/community/createreply', function(req, res, next) {
  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }
  
  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;
    let body = req. body;

    models.communityreply.create({
      writer : loginuser,
      reply : body.reply,
      createTime : new Date()
    })
    .then(result => {
      console.log("댓글 작성 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err => {
      console.log("댓글 작성 실패");
      console.log(err);
      res.json({
        resultCode : resCode.Failed,
        message : resCode.CreateError
    });
    })
  }
  else {
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});

router.put('/community/updatereply', function(req, res, next) {
  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }
  
  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;
    let body = req.body;

    models.communityreply.update({
      reply: body.reply,
      createTime: new Date()
    }, {
        where: { id: loginuser, replyno : body.replyno }
    })
    .then( result => {
      console.log("댓글 수정 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err => {
      console.log("댓글 수정 실패");
      console.log(err);
      res.json({ resultCode : resCode.Failed,
                 message: resCode.UpdateError
      });
    });
  }
  else{
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});

router.delete('/community/deletereply', function(req, res, next) {
  var token= req.headers.token;

  if( req.user) {
    var token = req.user[0];
    var loginuser = req.user[1];
  }
  
  if(verify(token, secretObj.secret)){

    let loginuser = req.signedCookies.userid;

    models.communityreply.destroy({
      where: {id : loginuser , replyno : body.replyno }
    })
    .then( result => {
      console.log("댓글 삭제 완료");
      res.json({
        resultCode : resCode.Success,
        message: resCode.SuccessMessage 
})
    })
    .catch( err =>{
      console.log("댓글 삭제 실패");
      console.log(err);
      res.json({ resultCode : resCode.Failed,
                 message: resCode.DeleteError });
    });
  }
  else{
    console.log("토큰이 만료 되었습니다");
    res.json({ resultCode : resCode.VerifyFailedCode,
      message : resCode.VerifyFailError
   });
  }
});



module.exports = router;
