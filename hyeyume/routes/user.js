var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var resCode = require('../resCode/codes');
var passport = require('passport');
var secretObj = require('../config/jwt');
var verify = require('../config/verify');

const AWS = require("aws-sdk");
const models = require('../models');
const FacebookStrategy = require('passport-facebook').Strategy;
const multer = require('multer');
const multerS3 = require('multer-s3');
AWS.config.loadFromPath(__dirname + '/../config/aws.json');

var salt = 'asdfsad%!@%!do5!hodsr';

router.use(cookieParser('asdgihasodghoasdg'));

router.use(session({
  secret : 'fdsofhsoadfhoo124124',
  resave: false,
  saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());


passport.serializeUser(function(user, done) {
    user = verify(token, secretObj.secret);
    done(null, user);
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

  console.log(body);
  console.log(changepwd);

  models.user.create({
    id : body.id,
    password : changepwd,
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
  let password = body.password;
  let changepwd = md5(password+salt);

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
    let changepassword = md5(change+salt);

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
                let jwttoken = jwt.sign({
                    id : result.id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
              return done(null, jwttoken);
            })
            .catch( err => {
              return console.log(err);
            });
        } else {
          var id = body.id;
  
          for(var i=0; i < result.length; i++){
            let user = result[i].dataValues;
        
            if( id == user.id){
                let jwttoken = jwt.sign({
                    id : user.id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
              return done(null, jwttoken);
              }
            }
  
          models.user.create({
            id : body.id,
            name : body.displayName
            })
            .then( result => {
                let jwttoken = jwt.sign({
                    id : result.id
                }, secretObj.secret ,
                {
                    expiresIn: '10m'
                })
              return done(null, jwttoken);
            })
             .catch( err => {
              return console.log(err);
            });
        }
      });
    })
  );

  router.get('/mypost', function(req, res, next) {
    
    let token = req.headers.token;
    let id = req.signedCookies.userid;

    if(verify(token, secretObj.secret)) {
        models.post.findAll({
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
