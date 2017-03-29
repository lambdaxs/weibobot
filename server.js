
const http = require('http');
const fs = require('fs');
const query_url = require('url');
const request = require('request');
const const_data = require('./config.json').const_data;
const client = require('./comment/DB');

const collection = async (name)=>{
    try{
        const db = await client.get_client();
        return db.collection(name)
    }catch (err){
        return Promise.reject(err)
    }
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
    res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});

    if (req.url.startsWith('/oauth/weibo')){
        const {url} = req;
        const {code,state} = query_url.parse(url,true).query;

        if(!code){
            console.log('回调地址中没有code');
            return res.end(`<h2>授权失败！</h2>`);
        }

        const post_data = {
            client_id:const_data.client_id,
            client_secret:const_data.client_secret,
            grant_type:'authorization_code',
            redirect_uri:const_data.redirect_uri,
            code,
        };

        const tokens = await collection('weibo_token');


        //微博授权
        const {uid,access_token} = await http_post(const_data.get_token,post_data);
        if (!uid || !access_token){
            return res.end(`<h2>授权失败！</h2>`);
        }

        if (!state){//取消授权
            //删除uid
            await tokens.findOneAndDelete({uid});
            const data = fs.readFileSync('./pages/remove.html');
            res.writeHead(200,{
                'Content-Type':'text/html;charset=utf-8;'
            });
            return res.end(data.toString());
        }

        //过滤城市信息
        //增加token
        await tokens.insertOne({
            uid,
            access_token,
            city:state
        });

        const data = fs.readFileSync('./pages/success.html');
        res.writeHead(200,{
            'Content-Type':'text/html;charset=utf-8;'
        });
        return res.end(data.toString());
    }else if(req.url.startsWith('/unoauth/weibo/')){
        const data = fs.readFileSync('./pages/remove.html');
        res.writeHead(200,{
            'Content-Type':'text/html;charset=utf-8;'
        });
        return res.end(data.toString());
    }else {
        console.log(new Date().toLocaleString());
        console.log('else');
        res.writeHead(404);
        return res.end(`not funod`);
    }
}).listen(3000);



