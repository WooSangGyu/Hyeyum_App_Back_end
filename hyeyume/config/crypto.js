const crypto = require('crypto');

function encrypt128(text) {
 
    if(typeof text == 'string' && text !== null) {
        const keyArr = [0X02,0X0B,0X01,0X09,0X0C,0X07,0X02,0X03,0X01,0X02,0X04,0X0D,0X0E,0X09,0X05,0X0A];
        const ivArr = [0X02,0X0B,0X01,0X09,0X0C,0X07,0X02,0X03,0X01,0X02,0X04,0X0D,0X0E,0X09,0X05,0X0A];
        var key = new (Buffer).from(keyArr);
        var iv = new (Buffer).from(ivArr);

        //암호화 과정
        var cipher = crypto.createCipher('aes-128-cbc', key, iv); // cipher 객체 생성하기 aes-128-cbc 알고리즘 사용, key, iv 전달
        cipher.setAutoPadding(true); // 암호 블록 사이즈와 데이터 사이즈가 맞지 않을 경우 배수에 맞춰 빈공간을 채워주는 방식
        var cipheredOutput = cipher.update(text, 'utf8', 'base64'); // 인코딩 방식에 따라 암호화 시키기
        cipheredOutput += cipher.final('base64'); // 암호화 된 결과 값을 담기
        return cipheredOutput;
    }
    else
    {
        return null;
    }
} 


function decrypt128(text) {

    if(typeof text == 'string' && text !== null) {


        const keyArr = [0X02,0X0B,0X01,0X09,0X0C,0X07,0X02,0X03,0X01,0X02,0X04,0X0D,0X0E,0X09,0X05,0X0A];
        const ivArr = [0X02,0X0B,0X01,0X09,0X0C,0X07,0X02,0X03,0X01,0X02,0X04,0X0D,0X0E,0X09,0X05,0X0A];
        var key = new (Buffer).from(keyArr); //key 설정
        var iv = new (Buffer).from(ivArr); //iv설정 iv: 초기화 벡터

        //복호화 과정
        var decipher = crypto.createDecipher('aes-128-cbc', key, iv); //decipher 객체 생성 aes-128-cbc 알고리즘을 사용, key, iv값 전달
        decipher.setAutoPadding(true); // 암호 블록 사이즈와 데이터 사이즈가 맞지 않을 경우 배수에 맞춰 빈공간을 채워주는 방식
        var decipheredOutPut = decipher.update(cipheredOutput, 'base64', "utf8"); // 디코딩 방식에 따라 복호화 시키기
        decipheredOutPut += decipher.final('utf-8'); // 복호화 된 결과값을 담기
        return decipheredOutPut;
    }
    else
    {
        return null;
    }
}