const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({

    product: {
        id:{

            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

        },
        name:String,
        price:Number,
        img: {
            type: String,
            default: 'placeholder.jpg',
          }
    },

    user: {
        id:{

            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

        },
        username:String,
        address:String,
        phone:String,
        email:String

        
    },

    
})



module.exports=mongoose.model("OrderItem", orderItemSchema);