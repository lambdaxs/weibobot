const xb = require('./xiaobing');

(async()=>{
    try{
        const rs = await xb.send_msg('ping~');
	console.log(new Date().toLocaleString());
        console.log(rs);
    }catch(err){
	console.log(new Date().toLocaleString());
        console.log('err');
        console.log(err);
    }
})()
