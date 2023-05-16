var mongoose=require("mongoose");

var commmentsSchema= mongoose.Schema({
     text:String,
     dateCreated: { type: Date, default: Date.now },
     author: {
          id:{
               type:mongoose.Schema.Types.ObjectId,
               ref:"User"
          },
          username:String
     }
});
// Note that we have added author with an Id and a username inorder to associate the logged in user with the comment

module.exports=mongoose.model("Comment", commmentsSchema);

