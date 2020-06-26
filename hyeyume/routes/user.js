var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var md5 = require('md5');
var sha256 = require('sha256');
var pbkfd2Password = require('pbkdf2-password');
var hasher = pbkfd2Password();
var jwt = require('jsonwebtoken');
var resCode = require('../resCode/codes');
var passport = require('passport');
var secretObj = require('../config/jwt');
var verify = require('../config/verify');

// const crypto = require('crypto');
const AWS = require("aws-sdk");
const models = require('../models');
const FacebookStrategy = require('passport-facebook').Strategy;
const multer = require('multer');
const multerS3 = require('multer-s3');
AWS.config.loadFromPath(__dirname + '/../config/aws.json');

var salt = 'asdfsad%!@%!do5!hodsr';
let encrypt128 = require('../config/crypto');
let decrypt128 = require('../config/crypto');

router.use(cookieParser('asdgihasodghoasdg'));

router.use(session({
  secret : 'fdsofhsoadfhoo124124',
  resave: false,
  saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());


passport.serializeUser(function(userpro, done) {
    if(verify(userpro[0], secretObj.secret)) {
      done(null, userpro);
    }
    else{
      console.log("사용자 정보를 받아오지 못했습니다.");
    }
  });
  
passport.deserializeUser(function(userpro, done) {
    console.log('deserializeUser', userpro);
    
    models.user.findOne({
      where : {
        id : userpro[1]
      }})
      .then( user => {
        console.log(userpro[2]);
        return done(null, userpro);
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
      successRedirect: '/api/gogo',
      failureRedirect: '/api/login'
    }
  )
);

router.get('/gogo', function(req, res, next) {
    console.log("세션 :", req.user);
    if( req.user) {
      res.send(`
      <h1> hello, ${req.user[2]} </h1>
      <a href="/auth/logout"> logout </a>
      `);
    }
  });

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

router.get('/upload', function(req, res) {
  res.render('upload');
});

router.post('/uploadprofile', upload.single("imgFile"), function(req, res, next) {
  var token = req.headers.token;
  var id = req.signedCookies.userid;

  if( req.user) {
    var token = req.user[0];
    var id = req.user[1];
  }

  if(verify(token, secretObj.secret)){
  let imgFile = req.file;
    if(imgFile.size<5000000){
          models.user.update({
          profilejpg : imgFile.key
        },
        {
            where : { id : id }
        })
          .then(result =>{
            res.json({
              resultCode : resCode.Success,
              message : resCode.SuccessMessage
            });
          })
          .catch(err => {
            console.log(err);
            res.json({
              resultCode : resCode.Failed,
              message : resCode.FailedMessage
            })
          })
      }
      else {
          console.log("사이즈가 너무 큽니다.");
      }
    }
  }
)

router.get('/login',function(req,res,next) {
  res.render('login');
})
router.post('/signup', function(req, res, next) {
  
  let body = req.body;
  let changepwd = encrypt128(body.password);

  // randombytes를 이용한 암호화
  // crypto.randomBytes(64, (err, buf) => {
  //   crypto.pbkdf2(body.password, buf.toString('base64'), 115616, 64, 'sha512', (err, key) => {
  //     console.log(key.toString('base64'));
  //     changepwd = key.toString('base64');
  //     console.log(changepwd);
  //   });
  // });

  models.user.create({
      id : body.id,
      password : changepwd,
      name : body.name,
      studentCode : body.studentCode,
      Th : body.th,
      salt : salts,
      profilejpg : body.profilejpg
    })
    .then( result => {
      console.log("회원가입 성공");
      res.json({ resultCode : resCode.Success,
                 message: resCode.SuccessMessage, 
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
  let password = body.password;
  let changepwd = sha256(password+salt);

  models.user.findOne({ where : {
      id : body.id,
      password : changepwd
    }})
    .then(userprofile => {
        let jwttoken = jwt.sign({
            id : userprofile.dataValues.id
        }, secretObj.secret ,
        {
            expiresIn: '10m'
        })
        var id = userprofile.dataValues.id;
        res.cookie('userid', id, { signed : true });
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

router.put('/changepwd', function(req, res, next) {
    let token = req.headers.token;
    let id = req.signedCookies.userid;

    let body = req.body;
    let change = body.pwd;
    let changepassword = sha256(change+salt);

    if(verify(token, secretObj.secret)) {
        models.user.update({
            password : changepassword
        },
        {
            where : { id : id }
        })
        .then( pwup => {
            console.log("비밀번호 변경 완료");
            res.json({ resultCode : resCode.Success,
                       message: resCode.SuccessMessage });
        })
        .catch( err => {
            console.log("비밀번호 변경 실패");
            console.log(err);
            res.json({ resultCode : resCode.Failed,
                       message: resCode.UpdateError });
        })
    }
    else {
        console.log("토큰이 없거나 만료되었습니다.");
        res.json({ resultCode : resCode.VerifyFailedCode,
                   message: resCode.VerifyFailError });
    }
})


passport.use(new FacebookStrategy({
    clientID: '651799692349093',
    clientSecret: 'edd74b82d25657477a9a8e78177dc973',
    callbackURL: "/api/auth/facebook/callback",
    profileFields:['id','displayName']
  },
    function(accessToken, refreshToken, profile, done) {
      let body = profile;
      console.log(profile);

      models.user.findAll()
        .then( result => {

          console.log(result);
  
        if(result.length == 0){
          models.user.create({
            id : body.id,
            name : body.displayName
            })
            .then( result => {
                console.log("아이디 생성 완료 :", result.dataValues.id);

                let jwttoken = jwt.sign({
                    id : result.dataValues.id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
                var userpro = [ jwttoken, result.dataValues.id, result.dataValues.name];
                console.log("userpro :",userpro[0], userpro[1], userpro[2]);
                console.log("jwt토큰 발행 :", jwttoken);
              return done(null, userpro);
            })
            .catch( err => {
              return console.log(err);
            });
        } else {
          var id = body.id;
  
          for(var i=0; i < result.length; i++){
            let user = result[i].dataValues;
            
            console.log(user);
            if( id == user.id){
                let jwttoken = jwt.sign({
                    id : id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
                console.log(jwttoken);
                var userpro = [ jwttoken, user.id, user.name];
              return done(null, userpro);
              }
            }
  
          models.user.create({
            id : body.id,
            name : body.displayName
            })
            .then( result => {
                let jwttoken = jwt.sign({
                    id : id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
                var userpro = [ jwttoken,  user.id, user.name];
              return done(null, userpro);
            })
             .catch( err => {
              return console.log(err);
            });
        }
      });
    })
  );

  router.get('/mypostcommunity', function(req, res, next) {
    
    var token = req.headers.token;
    var id = req.signedCookies.userid;

    if( req.user) {
      var token = req.user[0];
      var id = req.user[1];
    }

    if(verify(token, secretObj.secret)) {
        models.community.findAll({
            where : {
                writer : id
            }
        })
        .then( findpost => {
            res.json({ resultCode : resCode.Success,
                       message: resCode.SuccessMessage,
                       success : findpost
                    });
        })
        .catch( err => {
            console.log(err);
            res.json({ resultCode : resCode.Failed,
                       message: resCode.ReadError });
        })
    }
    else {
        console.log("토큰이 없거나 만료되었습니다.");
        res.json({ resultCode : resCode.VerifyFailedCode,
                   message: resCode.VerifyFailError });
    }
})

router.get('/mypostcontest', function(req, res, next) {
    
  var token = req.headers.token;
  var id = req.signedCookies.userid;

  if( req.user) {
    var token = req.user[0];
    var id = req.user[1];
  }

  if(verify(token, secretObj.secret)) {
      models.contest.findAll({
          where : {
              writer : id
          }
      })
      .then( findpost => {
          res.json({ resultCode : resCode.Success,
                     message: resCode.SuccessMessage,
                     success : findpost
                  });
      })
      .catch( err => {
          console.log(err);
          res.json({ resultCode : resCode.Failed,
                     message: resCode.ReadError });
      })
  }
  else {
      console.log("토큰이 없거나 만료되었습니다.");
      res.json({ resultCode : resCode.VerifyFailedCode,
                 message: resCode.VerifyFailError });
  }
})

router.post('/logout', function(req, res, next) {
    res.clearCookie('userid').send(req.signedCookies.userid);
})

module.exports = router;