var mongoose=require("mongoose");


const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],

    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

// Note that we have added author with an Id and a username inorder to associate the logged in user with the comment

module.exports=mongoose.model("Order", orderSchema);

