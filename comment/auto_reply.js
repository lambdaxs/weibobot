let request = require('request');
const {mine} = require('../config.json');
const xb = require('./xiaobing');
const fs = require('fs');
let reply_ids = require('./reply_ids.json');
const auto_login = require('./auto_login');
const client = require('./DB');

const collection = async (name)=>{
    try{
        const db = await client.get_client();
        return db.collection(name)
    }catch (err){
        return Promise.reject(err)
    }
};

//获取我收到的评论列表
const get_comments = (token)=>{
    return new Promise((s,f)=>{
        request.get(`https://api.weibo.com/2/comments/to_me.json?access_token=${token}&count=10`,(err,res,body)=>{
            if (!err && res.statusCode == 200){            
                s(JSON.parse(body));
            }else {
                f(err);
            }
        });
    });
};

//回复评论
const reply_comment = (data)=>{
    return new Promise((s,f)=>{
        request.post('https://api.weibo.com/2/comments/reply.json',{form:data},(err,res,body)=>{
            if (!err && res.statusCode == 200){            
                s(JSON.parse(body));
            }else {
                f({
                    err,
                    body
                });
            }
        });
    })
};

(async()=>{
    try {
        const token = mine.my_token;
        const datas = await get_comments(token);
        //评论id
        const comment_id = datas.comments[0].id;


        const reply_ids = await collection('reply_ids');

        //判断评论是否已存在
        let comment_exists = await reply_ids.findOne({comment_id});
        if(comment_exists){
            console.log(comment_id);
            console.log(new Date().toLocaleString());
            console.log('没有新的评论');
            return;
        }

        //用户名
        const user_name = datas.comments[0].user.name;
        //微博id
        const status_id = datas.comments[0].status.id;
        //评论内容
        const comment = datas.comments[0].reply_original_text || datas.comments[0].text;
        //回复
        const reply = await xb.send_msg(comment);
        //发布回复
        await reply_comment({
            access_token:mine.my_token,
            comment:reply,
            cid:comment_id,
            id:status_id
        });



        //将评论存入数据库
        await reply_ids.insertOne({
            comment_id,
            user_name,
            comment,
            reply
        });

        //输出日志
        console.log(new Date().toLocaleString());
        console.log(`${user_name}:${comment}====>${reply}`);

    } catch (error) {
		console.log('error');
        console.log(error);
        //cookie过期 获取新的cookie
        const sub = await auto_login.get_sub();
        //写入sub.json文件
        fs.writeFileSync('./sub.json',sub);
    }
})();
