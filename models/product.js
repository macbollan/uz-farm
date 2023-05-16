const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const domPurifier = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);

// const stripHtml = require('string-strip-html');

//initialize slug
// mongoose.plugin(slug);
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  timeCreated: {
    type: Date,
    default: () => Date.now(),
  },
  snippet: {
    type: String,
  },
  img: {
    type: String,
    default: 'placeholder.jpg',
  },
  price : {
    type: Number,
    default:0
},
  author:{
    id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    username:String 
},

 
});



module.exports = mongoose.model('Product', productSchema);
