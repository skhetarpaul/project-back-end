const express= require('express');
const bodyparser=require('body-parser');
//const exphbar=require('express-handlebars');
const nodemailer=require('nodemailer');
const path=require('path');
var app=express();
require('es6-promise').polyfill();
require('isomorphic-fetch');

//view engine is handlebars
// app.engine('handlebars',exphbar());
// app.set('view engine','handlebars');

// setting up a middleware thro' body-parser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
//to get to a static file locaion
app.use('/public',express.static(path.join(__dirname,'public')));

const router =express.Router();
var restaurant=require('../models/restro');
var mongoose= require('mongoose');


//Request description:This is equivalent for finding all entries of restaurants from the database with pagintion enabled.
router.get('/restroall',function(req,res,next){
restaurant.find({}).then(function(restros){
var pagecnt=Math.ceil((restros.length)/5);
let page=parseInt(req.query.p);
if(!page){page=1;}
if(page > pagecnt){page=pagecnt;}
res.json({
    "page":Math.ceil(page),
    "pagecount":(pagecnt),
    "restros":restros.slice(page*5-5,page*5)
});
console.log(restros.length);
});
});

//to get just one entry by providing its id to request.
router.get('/restro/:id',function(req,res,next){
    restaurant.findOne({}).then(function(restro){
    res.send({restro});
    });
    });

   /*A more dynamic GET request where when you provide latitude and longitude of a location,you get all restaurants within
    15 kms(maxDistance).
    Features inclusive : GEOLOCATION to find the distance between two geographical positions. */
router.get('/restro',function(req,res,next){
restaurant.aggregate().near({
    near:{
        'type':'Point',
        'coordinates':[parseFloat(req.query.lat),parseFloat(req.query.lng)]
    },
    maxDistance:15000,
    spherical:true,
    distanceField:"dis"
}).then(function(restros){
    //res.send(restros);
    var pagecnt=Math.ceil((restros.length)/5);
let page=parseInt(req.query.p);
if(!page){page=1;}
if(page > pagecnt){page=pagecnt;}
res.json({
    "page":Math.ceil(page),
    "pagecount":(pagecnt),
    "restros":restros.slice(page*5-5,page*5)
});
console.log(restros.length);
});
});

/*A GET request similar to previous one with an addition that you no longer need to enter a Latitude and longitude for a place.
An API key automatically updates latitude and longitude just by knwing your city and displays hotels nearby.
Features inclusive: Use of API keys,GEOLOCATION ,fetch() method ,using JSON */  
router.get('/restronear',function(req,res,next){
 var api='http://api.openweathermap.org/data/2.5/weather?q=';
 var city='Delhi';//change to other location to get restaurants near to that place
 var id='&APPID=3c73799cbf6f574cb5c370c7853535b4&CALLBACK=skpaul';
    var fetchdata=fetch(api+city+id);
    var jsondata;    
    fetchdata.then(
            function(u){ return u.json();}
          ).then(
            function(json){
              jsondata = json;
              console.log(jsondata);
              restaurant.aggregate().near({
        near:{
            'type':'Point',
            'coordinates':[parseFloat(jsondata.coord.lat),parseFloat(jsondata.coord.lon)]
        },
        maxDistance:2000,
        spherical:true,
        distanceField:"dis"
    }).then(function(restros){
        //res.send(restros);
        var pagecnt=Math.ceil((restros.length)/5);
    let page=parseInt(req.query.p);
    if(!page){page=1;}
    if(page > pagecnt){page=pagecnt;}
    res.json({
        "page":Math.ceil(page),
        "pagecount":(pagecnt),
        "restros":restros.slice(page*5-5,page*5)
    });
    console.log(restros.length);
    });
            }
            
          );   
    
    });

    
/*Method to generate a POST api request to enter a new dataset to your database.This request will automatically send an email 
to the data holder about the details for the new entry.
Features Inclusive: NODEMAILER */
router.post('/restro',function(req,res,next)
{restaurant.create(req.body).then(function(restro)
    {
        const output=`<p>You got a new entry for the best restaurants in Delhi</p>
        <h2>Details are as follows:</h2>
        <ul>
        <li>Name: ${req.body.name}</li>
        <li>Ratings: ${req.body.ratings}</li>
        <li>Location: ${req.body.geometry.cordinates}</li>
        </ul>
        `;

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: 'afkcmqjsuzhuyl64@ethereal.email', // generated ethereal user
              pass: '6SwvA1htXqCpppa2ep' // generated ethereal password
            },
            tis:{rejectUnauthorised:false}
          });
        
          // setup email data with unicode symbols
          let mailOptions = {
            from: '"Nodemailer test by skPaul" <afkcmqjsuzhuyl64@ethereal.email>', // sender address
            to: "saranshkhetarpaul99@gmail.com", // list of receivers
            subject: "Nodemailer test by skPaul ✔", // Subject line
            text: "Hey there !!", // plain text body
            html: output // html body
          };
          let info =  transporter.sendMail(mailOptions)
        
          console.log("Message sent: %s", output);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          res.send(restro);
  
        }).catch(next);

        
    });
  
//Update any of the existing Record by a PUT api request.
router.put('/restro/:id',function(req,res)
{
    restaurant.findByIdAndUpdate({_id:req.params.id},req.body).then(function(){
        restaurant.findById({_id:req.params.id}).then(function(restro){
            res.send({restro});
        })
    })
});

//To Delete an existing Record from database
router.delete('/restro/:id',function(req,res)
{
    restaurant.findByIdAndRemove({_id:req.params.id}).then(function(restro){
        res.send({restro});
    })
});

module.exports=router;