var express = require('express');
var session = require('express-session');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var resCode = require('../resCode/codes');
var passport = require('passport');

const AWS = require("aws-sdk");
const models = require('../models');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const multer = require('multer');
const multerS3 = require('multer-s3');
AWS.config.loadFromPath(__dirname + '/../config/aws.json');

var salt = 'asdfsad%!@%!do5!hodsr';

router.use(session({
  secret : 'fdsofhsoadfhoo124124',
  resave: false,
  saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);

    models.user.findOne({
      where : {
        id : body.id,
        password : body.password
      }})
      .then( user => {
        return done(null, user);
      })
      .catch( err => {
        console.log(err);
      })
  });

router.get('/auth/facebook',
    passport.authenticate('facebook')
  );

router.get('/auth/facebook/callback',
    passport.authenticate('facebook',
    {
      successRedirect: '/',
      failureRedirect: '/'
    }
  )
);

let s3 = new AWS.S3();

let upload = multer({
  storage: multerS3({
      s3 : s3,
      bucket: "hyeyum",
      key: function (req, file, cb) {
          let extension = path.extname(file.originalname);
          cb(null, Date.now().toString()+extension)
      },
      size: 5000000,
      acl:'public-read-write'
  })
});

router.post('/uploadprofile', upload.single("imgFile"), function(req, res, next) {
  let imgFile = req.file;
    if(imgFile.size<5000000){
        res.json(imgFile);
    }
    else {
        console.log("사이즈가 너무 큽니다.");
    }
})
router.post('/signup', function(req, res, next) {
  
  let body = req.body;

  let password = body.password;
  let changepwd = md5(password+salt);

  models.user.create({
    id : body.id,
    password : body.changepwd,
    name : body.name,
    studentCode : body.studentCode,
    Th : body.th,
    profilejpg : body.profilejpg
  })
  .then( result => {
    console.log("회원가입 성공");
    res.json({ resultCode : resCode.Success,
               message: resCode.SuccessMessage 
})
  })
  .catch( err => {
    console.log(err);
    res.json({
      resultCode : resCode.Failed,
      message : resCode.CreateError
  });
  })
});

router.post('/signin', function(req, res, next) {
  
  let body = req.body;

  models.user.findOne({ where : {
      id : body.id,
      password : body.password
    }})
    .then(userprofile => {
        let jwttoken = jwt.sign({
            id : userprofile.dataValues.id
        }, secretObj.secret ,
        {
            expiresIn: '10m'
        })
        var id = userprofile.dataValues.id;
        res.cookie('userid', id, { signed:true });
        res.json({ resultCode : resCode.Success,
                   message: resCode.SuccessMessage,
                  token : jwttoken });
    })
    .catch(err => {
        console.log(err);
        res.json({ resultCode : resCode.Failed,
                   message: resCode.ReadError });
    });
});


passport.use(new FacebookStrategy({
    clientID: '651799692349093',
    clientSecret: 'edd74b82d25657477a9a8e78177dc973',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id','displayName']
  },
    function(accessToken, refreshToken, profile, done) {
      let body = profile;

      models.user.findAll()
        .then( result => {
  
        if(result.length == 0){
          models.user.create({
            id : body.id,
            name : body.displayName
            })
            .then( result => {
              return done(null, result);
            })
            .catch( err => {
              return console.log(err);
            });
        } else {
          var id = body.id;
  
          for(var i=0; i < result.length; i++){
            let user = result[i].dataValues;
        
            if( id == user.id){
              return done(null, user);
              }
            }
  
          models.user.create({
            id : body.id,
            name : body.displayName
            })
            .then( result => {
              return done(null, result);
            })
             .catch( err => {
              return console.log(err);
            });
        }
      });
    })
  );

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

router.post('/createpost', function(req, res, next) {

  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;
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

router.put('/updatepost', function(req, res, next) {
  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;
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

router.delete('/deletepost', function(req, res, next) {
  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;
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


router.post('/createreply', function(req, res, next) {
  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;
    let body = req. body;

    models.reply.create({
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

router.put('/updatereply', function(req, res, next) {
  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;
    let body = req.body;

    models.reply.update({
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

router.delete('/deletereply', function(req, res, next) {
  let token= req.headers.token;

  if(verify(token, secretObj.secret)){

    let loginuser = req.headers.id;

    models.reply.destroy({
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
