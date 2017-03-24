
const http = require('http');
const fs = require('fs');
const query_url = require('url');
const request = require('request');

const const_data = {
    client_id:'529280005',
    client_secret:'409d20047a0ab16d345046c89dd23cb6',
    get_token:'https://api.weibo.com/oauth2/access_token',
    redirect_uri:'http://123.206.15.206:3000/oauth/weibo',
    token_path:'./token.json'
};

const http_post = (url,data)=>{
    return new Promise((s,f)=>{
        request.post(url, {form:data},(err,rs,body)=>{
            if (err){
                f(rs);
            }else {
                s(JSON.parse(body));
            }
        })
    })
};

http.createServer(async (req,res)=>{
    if (req.url.startsWith('/oauth/weibo')){
        const {url} = req;
        const {code} = query_url.parse(url,true).query;
        if(!code)console.log('回调地址中没有code');
        const post_data = {
            client_id:const_data.client_id,
            client_secret:const_data.client_secret,
            grant_type:'authorization_code',
            redirect_uri:const_data.redirect_uri,
            code,
        };
        const {uid,access_token} = await http_post(const_data.get_token,post_data);
        if (fs.existsSync(const_data.token_path)){
            const token_datas = require('./token.json');
            token_datas.push({
                uid,access_token
            });
            fs.writeFileSync(const_data.token_path,JSON.stringify(token_datas));
        }else {
            fs.writeFileSync(const_data.token_path,JSON.stringify([{uid,access_token}]));
        }
    }else if(req.url.startsWith('/unoauth/weibo/')){
        console.log('todo');
    }else {
        console.log('todo');
    }
    res.end(JSON.stringify({msg:'获取token成功'}));
}).listen(3000);



