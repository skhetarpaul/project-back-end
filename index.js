const express=require('express');
var bodyparser=require('body-parser');
const mongoose= require('mongoose');
const app=express();
//var expressbars=require('express-handlebars');
var server=app.listen(4000,function(){
    console.log('listening to requests 4000');
});


//for establishing websockets
var socket=require('socket.io');


app.use(express.static('public'));

var io=socket(server);
io.on('connection',function(socket){console.log('made a connection',socket.id);


socket.on('chat',function(data){
io.sockets.emit('chat',data);//refers to all the sockets connected to sever be 4 5 or even many	
});



socket.on('typing',function(data)
{
	socket.broadcast.emit('typing',data);
});

});
//exiting websocket index


//create database named restaurant
mongoose.connect('mongodb://localhost/restaurant',{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.Promise=global.Promise;

const router=require('./routes/api');

app.use(bodyparser.json());
app.use('/api',router);
 app.use(function(err,req,res,next)
 {
console.log(err);
res.status(422).send({error:err.message});
 });
 

