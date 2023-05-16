

const mongoose = require('mongoose');
//  mongoose.connect("mongodb+srv://macb:vGdEAESmK0GRqDrl@cluster.xfzxm.mongodb.net/?retryWrites=true&w=majority");
require('dotenv').config();

var express=require("express");
var bodyParser =require("body-parser");

const compression= require("compression");
// const { getVideoDurationInSeconds } = require('get-video-duration');




var app=express();
var passport =require("passport");
var LocalStrategy =require("passport-local");
var methodOverride=require("method-override");
var flash =require("connect-flash");
// note that we have to require the modeled files 
var Product=require("./models/product.js");
var Order=require("./models/order.js");
var OrderItem=require("./models/order-item.js");
var User=require("./models/user.js");
var Video=require("./models/video.js");
const user = require("./models/user.js");
const { findByIdAndUpdate } = require("./models/product.js");
var geocoder = require('geocoder');
var multer= require ("multer");
var path= require("path");
const formidable = require('formidable');
var fileSystem = require("fs");
const ObjectId = mongoose.Types.ObjectId;


mongoose.connect("mongodb://localhost/uzfarm5");



app.use(compression())


app.use(bodyParser.json( { limit: "10000mb" } ));
app.use(bodyParser.urlencoded( { extended: true, limit: "10000mb", parameterLimit: 1000000 } ));


app.use(methodOverride("_method"))
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(flash());
// note all static file goes in the public dir.....make sure to select it in that ways

// PASSPORT CONFIG==================================================
app.use(require("express-session")({
    secret:"the secret",
    resave:false,
    saveUninitialized:false
}));

app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// PASSPORT CONFIG==================================================


// OUR OWN MIDDLEWARE
// this registers current user on eachh and every template with /partials/header or footer
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    // note this also makes "massage" be recognised on every template rather than adding it individualy on every temp
    // res.locals.massage=req.flash("error");
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});



// ===========================================APA NDOPA COMMENTWA============================================================

  //   var storage = multer.diskStorage({
  //       filename: function(req, file, callback) {
  //         callback(null, Date.now() + file.originalname);
  //       }
  //     });

  //   //define storage for the images

  //   var imageFilter = function(req, file, cb) {
  //       // accept image files only
  //       if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
  //         return cb({ message: "This file is not an image file" }, false);
  //       }
  //       cb(null, true);
  //     };

  // //upload parameters for multer
  // const upload = multer({
  //   storage: storage,
  //   fileFilter: imageFilter
  //   // limits: {
  //   //   fieldSize: 1024 * 1024 * 3,
  //   // },
  // });


  const storage = multer.diskStorage({
    //destination for files
    destination: function (request, file, callback) {
      callback(null, './public/uploads/images');
    },
  
    //add back the extension
    filename: function (request, file, callback) {
      callback(null, Date.now() + file.originalname);
    },
  });
  
  //upload parameters for multer
  const upload = multer({
    storage: storage,
    limits: {
      fieldSize: 1024 * 1024 * 3,
    },
  });
  

  // ===========================================APA NDOPA COMMENTWA============================================================

var cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "macb",
  api_key: "182998264394398",
  api_secret: "zhmA4pTMuHfdIn0oL8S_nAykl8c"
});



// AUTH ROUTES=============================================================================

app.get("/new",isLoggedIn,function(req,res){
  res.render("new.ejs" ,{currentUser:req.user});
    
});


// REGISTER
app.get("/register",function(req,res){
    res.render("register.ejs",{currentUser:req.user});
});


// LOGIN
app.get("/login",function(req,res){
  res.render("login.ejs",{currentUser:req.user, massage: req.flash("error")});
});
app.post("/login",passport.authenticate("local", {
       
       successFlash:"succesfully Logged in",
       successRedirect:"/",
       failureRedirect:"/login",
       failureFlash:true
}),function(req,res){
 
});

app.get('/cart', isLoggedIn, (req,res)=>{

  OrderItem.find({'user.id':req.user._id}, function(err,products){
          
          if(err){
          console.log(err)
          req.flash("error",err);
          res.redirect("/")
      }else{

          let totalPrice = 0; // Initialize total price to 0

          products.forEach(function(product) {
           
              totalPrice += product.product.price; // Add price of each product to total price
           });
          res.render("cart.ejs",{no_of_items:products.length,products:products,currentUser:req.user,totalPrice:totalPrice})
      
      }
 });
})



// Note there is "req.user" this checks if the user is authenticated or logged in
app.get("/orders", async function(req, res) {
  try {
    const allProducts = await Product.find({});
    let noOfItems = 0;
    if (req.user) {
      const items = await OrderItem.find({'user.id':req.user._id});
      noOfItems = items.length;
    }
    const orderItems = await OrderItem.find({});
    noOfItems=orderItems  .length;
    res.render("orders.ejs", {
      no_of_items: noOfItems,
      products: allProducts,
      currentUser: req.user,
      order_items: orderItems
    });
  } catch (err) {
    console.log(err);
  }
});


// LOGOUT
app.get("/logout",function(req,res){
  req.logout( (err)=>{
        if(err){
            console.log(err)
        }else{

            req.flash("success","Successfully logged out");
            res.redirect("/");
            // res.render("login.ejs",{currentUser:req.user});
        }
  } );
});




// Note there is "req.user" this checks if the user is authenticated or logged in
app.get("/", async function(req, res) {
  try {
    const allProducts = await Product.find({});
    let noOfItems = 0;
    let noOfItems2 = 0;
    if (req.user) {
      const items = await OrderItem.find({'user.id':req.user._id});
      noOfItems2=items.length;
      
    }
    const orderItems = await OrderItem.find({});
    noOfItems = orderItems.length;
    res.render("products.ejs", {
      no_of_items2:noOfItems2,
      no_of_items: noOfItems,
      products: allProducts,
      currentUser: req.user,
      order_items: orderItems
    });
  } catch (err) {
    console.log(err);
  }
});

// Note there is "req.user" this checks if the user is authenticated or logged in
app.get("/products", async function(req, res) {
  try {
    const allProducts = await Product.find({});
    let noOfItems2 = 0;
    let noOfItems = 0;
    if (req.user) {
      const items = await OrderItem.find({'user.id':req.user._id});
      noOfItems2=items.length;
    }
    const orderItems = await OrderItem.find({});
    noOfItems = orderItems.length;
    res.render("products1.ejs", {
      no_of_items: noOfItems,
      products: allProducts,
      currentUser: req.user,
      order_items: orderItems
    });
  } catch (err) {
    console.log(err);
  }
});


app.get("/:name",isLoggedIn,(req,res)=>{
   OrderItem.find({'product.name':req.params.name}, (err,orders)=>{

    if(err){
        console.log(err)
    }
    res.render('available_orders.ejs',{orders:orders,noOfItems:orders.length})
   })
})



app.post("/register", function(req,res){
  newUser = new User({
     username: req.body.username,
     surname: req.body.surname,
     email: req.body.email,
     phone: req.body.phone,
     address: req.body.address,
   });
   User.register(newUser,req.body.password,function(err,user){
        if(err){
         req.flash("error",err.message);
            console.log(err)
            res.redirect("/register");
        }
         passport.authenticate("local")(req,res,function(){
          req.flash("success", "Successfully registered");  
          res.redirect("/");
      });
   });
});



  

  
      // app.post('/blogs', upload.single('image'), async (request, response) => {
      //   // console.log(request.file);
      //   // console.log(request.body);
      //   let blog = new Blog({
      //     name: request.body.name,
      //     author:{
      //       id:request.user._id,
      //       username:request.user.username
      //   },
      //     description: request.body.description,
      //     img: request.file.filename,
      //   });
      
      //   try {
      //     blog = await blog.save();
    
      //     request.flash("success","Successfuly Created Blog");
      
      //     response.redirect("/blogs");
      //   } catch (error) {
      //       request.flash("error",error.message);
      //     console.log(error);
      //   }
      // });
  
  

// =============================================================================================

app.post("/", upload.single("image"), async (req, res) => {
      
  // Upload image to cloudinary================================These two are out of bounds
  // const result = await cloudinary.uploader.upload(req.file.path);
  // console.log(result.secure_url);

  // Create new blog
  let product = new Product({
    name: req.body.name,
    author:{
         id:req.user._id,
         username:req.user.username
     },
   description: req.body.description,
   price:req.body.price,
  //  img: result.secure_url,
   img: req.file.filename,
});
try {
  // Save blog
  await product.save();
  req.flash("success","Successfuly Created Product");

  res.redirect("/products");
} catch (err) {
    req.flash("error",err.message);
  console.log(err);
}
});


// Adding an order item
app.post("/:id", isLoggedIn,(req,res)=>{

  Product.findById(req.params.id, function(err,product){

      // console.log(product)

      try {
          let amount = req.body.amount;
          let totalPrice = amount;

          let orderItem = new OrderItem({
            
            user:{
                 id:req.user._id,
                 username:req.user.username,
                 address:req.user.address,
                 phone:req.user.phone,
                 email:req.user.email
             },
  
             product:{
                  id:product._id,
                  name:product.name,
                  price:totalPrice,
                  img:product.img
             }
         
        });
          // Save order
           orderItem.save();
          req.flash("success","Successfully Added to cart");
   
          res.redirect("/");
        } catch (err) {
            req.flash("error",err.message);
          console.log(err);
        }
  
  })
  
})

  


app.put("/:id",function(req,res){
 
      Product.findByIdAndUpdate(req.params.id,req.body.product, function(err,updatedProduct){
           if(err){
               console.log(err)
               req.flash("error","Failed to update");
               res.redirect("/products")
           }else{
            req.flash("success","Successfully updated product");
               res.redirect("/products");
           }
      });
});
// DELETE
app.delete("/:id",function(req,res){
    OrderItem.findByIdAndDelete(req.params.id,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("/");
        }else{
            req.flash("success","Successfully deleted order");
            res.redirect("back");
        };
    });
});

app.delete("/product/:id",function(req,res){
  Product.findByIdAndDelete(req.params.id,function(err){
      if(err){
          req.flash("error",err.message);
          res.redirect("/products");
      }else{
          req.flash("success","Successfully deleted order");
          res.redirect("/products");
      };
  });
});







// Middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    // we use flash with 2 arguments e.g req.flash("key", "value");
     req.flash("error","Please loggin first");
     res.redirect("/login");
    };
    
    // Our Middleware to check ownership of the poster
    function checkOwnership(req,res,next){
    if(req.isAuthenticated()){
        Product.findById(req.params.id, function(err,foundProduct){
            if(err){
                console.log(err);
                res.redirect("back");
            }else{
                
                // does user own the blog?
                if(req.user._id.equals(foundProduct.author.id)){
                    //    note we used ".equals()" instead of "===" for comparison !!!!!
                    next();
                }else{
                    req.flash("error","You Can only edit your own posts");
                    res.redirect("back");
                };
            };
        });
    };
}

// AUTH ROUTE=============================================================================

// MIDDLEWARES CAN BE REFACTORED INTO ANOTHER DIR AND THEN REQUIRED  

app.listen(80, function(){
    console.log("App Has Started!!!! on port 80");
});
