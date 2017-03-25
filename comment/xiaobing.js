var request = require('request');
const common = require('./common');

var FileCookieStore = require('tough-cookie-filestore');
var j = request.jar(new FileCookieStore(__dirname+'/cookies.json'));
request = request.defaults({ jar :j})

const rec_options = {
    url: 'http://m.weibo.cn/msg/messages?uid=5175429989&page=1',
    headers: {
        'User-Agent': common.userAgent,
        'Referer':common.Referer,
        'Cookie':common.Cookie
    }
};

const rec_msg = ()=>{
    return new Promise((s,f)=>{
        request(rec_options,(err,res,body)=>{
            if (!err && res.statusCode == 200) {
                const data = JSON.parse(body);
                s({
                    text:data.data[0].text,
                    name:data.data[0].sender_screen_name
                })
            }else {
                f(err);
            }
        });
    })
};


const send_options = (content)=>{
    return {
        method:'POST',
        url:'http://m.weibo.cn/msgDeal/sendMsg',
        headers:{
            'User-Agent': common.userAgent,
            'Referer':common.Referer,
            'Cookie':common.Cookie
        },
        form:{
            field:null,
            content,
            st:'07fdff',
            uid:'5175429989'
        }
    }
};


const get_new_msg = (question)=>{
    return new Promise((s,f)=>{
        rec_msg().then(({text,name})=>{
            if (name !== '小冰'){
                return s(get_new_msg(question));
            }else {
                return s(text);
            }
        })
    })
};

const send_msg = (question)=>{
    return new Promise((s,f)=>{
        request(send_options(question),(err,res,body)=>{
            if (!err && res.statusCode == 200){
                const {ok} = JSON.parse(body);
                if (ok==1){//发送成功
                    s(get_new_msg(question));
                }else {
                    f(err)
                }
            }
        });
    });
};


module.exports = {
    send_msg
};