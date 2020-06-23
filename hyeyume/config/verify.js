let jwt = require('jsonwebtoken');

const verify = ((token, secret) => {
    try {
        let decoded = jwt.verify(token, secret);

        if(decoded){
            return true
        }
        else {
            return false
        }
    }
    catch(err) {
        if (err.name == 'TokenExpiredError') {
            return resizeBy.status(419).json({
                resultCode: 419,
                message: "토큰 만료"
            });
        };
        return res.status(401).json({
            resultCode : 401,
            message: "토큰이 유효하지 않습니다."
        })
    }
});

module.exports = verify