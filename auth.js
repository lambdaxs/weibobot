const app = require("express")();
const basicauth = require('basic-auth');
const http = require('http');
const auth = (req,res,next)=>{
	const unauth = (res)=>{
	  res.set('WWW-Authenticate','Basic realm=Input User&Password');
	  return res.sendStatus(401);
	}
	const user = basicauth(req);
	if(!user || !user.name || !user.pass){
	  return unauth(res);
	}
	if(user.name === 'xs' && user.pass === '199438'){
		return next();
	}else {
		return unauth(res);
	}
}
app.use(auth);
app.get("/",function(req,res){
	res.redirect(302,'http://console.xsdota.com:8001');
});
const server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
