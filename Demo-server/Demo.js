let user = require('./User');

console.log(`userName:${user.userName}`);
console.log(`I'm ${user.userName},I say${user.sayHello()}`);

let http = require('http');
let url = require('url');
let util =require('util');
let server = http.createServer((req,res)=>{
	res.statusCode = 200;
	res.setHeader("Content-Type","text/plain; charset=utf-8");
	
	res.end(util.inspect(url.parse("http://127.0.0.1:3000/1223.html?a=123")));
});
server.listen(3000,'127.0.0.1',()=>{
	console.log("服务器已经运行，打开 http://127.0.0.1:3000/")
});

