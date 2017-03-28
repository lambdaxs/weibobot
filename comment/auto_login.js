const Sinalogin = require('sinalogin');
const request = require('request');
const config = require('../config.json');

const account = {
    name: config.mine.my_account,
    passwd: config.mine.my_password,
    cookiefile: 'cookie.dat'
};

const get_sub = ()=>{
    return new Promise((s,f)=>{
        Sinalogin.weibo_login(account, function(err, loginInfo){
            if (err){
                f(err)
            }else {
                if(loginInfo.logined){
                    const j = loginInfo.j;
                    request({url: 'http://weibo.com/u/3002082365/home?wvr=5', jar: j}, function (err, response, body) {
                        const res = JSON.parse(JSON.stringify(j));
                        const sub = res._jar.cookies.filter(cookie=>{
                            return cookie.key === 'SUB';
                        }).pop().value;
                        s(sub);
                    });
                }else {
                    f()
                }
            }
        });
    });
};


module.exports = {
    get_sub
};

