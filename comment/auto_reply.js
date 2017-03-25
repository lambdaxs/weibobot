let request = require('request');
const {mine} = require('../config.json');
const xb = require('./xiaobing');
const fs = require('fs');
const reply_ids = require('./relpy_ids.json');

//获取我收到的评论列表
const get_comments = (token)=>{
    return new Promise((s,f)=>{
        request.get(`https://api.weibo.com/2/comments/to_me.json?access_token=${token}&count=1`,(err,res,body)=>{
            if (!err && res.statusCode == 200){            
                s(JSON.parse(body));
            }else {
                f(err);
            }
        })
    });
}

//回复评论
const reply_comment = (data)=>{
    return new Promise((s,f)=>{
        request.post('https://api.weibo.com/2/comments/reply.json',{formData:data},(err,res,body)=>{
            if (!err && res.statusCode == 200){            
                console.log(res);
                s(JSON.parse(body));
            }else {
                f({
                    err,
                    body
                });
            }
        });
    })
}

(async()=>{
    try {
        const token = mine.my_token;
        const datas = await get_comments(token);
        //评论id
        const comment_id = datas.comments[0].id;
        if (reply_ids.indexof(comment_id) !== -1){//已存在
            console.log(new Date().toLocaleString());
            console.log('没有新的评论');
            return;
        }
        //微博id
        const status_id = datas.comments[0].status.id;
        //评论内容
        const comment = datas.comments[0].reply_original_text
        //回复
        const reply = await xb.send_msg(comment);
        //发布回复
        await reply_comment({
            access_token:mine.my_token,
            comment:'我就是小冰！',
            cid:4089110388351973,
            id:4088779897497452
        })
        //将评论id 存入已回复列表
        reply_ids.push(comment_id);
        fs.writeFileSync('./reply_ids.json',JSON.stringify(reply_ids));

        //输出日志
        const user_name = datas.comments[0].user.name;
        console.log(new Date().toLocaleString());
        console.log(`${user_name}:${comment}====>${reply}`);
    } catch (error) {
        console.log(error);
    }
})();