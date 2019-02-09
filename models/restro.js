const mongoose = require('mongoose');
const schema = mongoose.Schema;

const locschema=new schema(
{
    type:{
        type:String,
        default:"Point"
        
    },
cordinates:{
    type:[Number],
    index:"2dsphere",
    required:[true,'geometric position is required']
}
});
const restroschema = new schema(
    {
        name:{
            type:String,
            required:[true,'Name is required']
        },
        ratings:{
            type:Number
        },
        //using geojson
        geometry:locschema
    }
    
);
var restro=mongoose.model('restro',restroschema);

//exporting to http requests
module.exports = restro;