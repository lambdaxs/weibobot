const request = require('request');
const config = require('./config.json');
const UID = config.weather_account.uid;
const KEY = config.weather_account.key;

const Api = require('./api.js');
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
    const tokens = require('./token.json');

    const weather_task = tokens.map(data=>{
        return api.getWeatherNow(data.city);
    });
    const weather_data = await Promise.all(weather_task);
    const weibo_datas = weather_data.map(({results})=>{
        const {location,now} = results[0];
        const {name} = location;
        const {text,temperature} = now;
        return `中国 ${name}，今天的天气是${text} 当前温度是${temperature}℃`;
    });

    const tasks = tokens.map((data,index)=>{
        return http_post('https://api.weibo.com/2/statuses/update.json',{
            access_token:data.access_token,
            status:weibo_datas[index]
        });
    });
    const log = await Promise.all(tasks);
    console.log(new Date().toLocaleString());
    console.log(log);
})();
