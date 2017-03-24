const request = require('request');
const UID = "U332663805";
const KEY = "3LFGKUFH1E";
const LOCATION = "Beijing";

const Api = require('./api.js');
const argv = require('optimist').default('l', LOCATION).argv;

const api = new Api(UID, KEY);

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

(async()=>{
    const {results} = await api.getWeatherNow(argv.l);
    const {location,now} = results[0];
    const {name} = location;
    const {text,temperature} = now;

    const status = `中国 ${name}，今天的天气是${text}， 当前温度是${temperature}℃`;
    const tokens = require('./token.json');
    const tasks = tokens.map(data=>{
        return http_post('https://api.weibo.com/2/statuses/update.json',{
            access_token:data.access_token,
            status
        });
    });
    await Promise.all(tasks);
})();
