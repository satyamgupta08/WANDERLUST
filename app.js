if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
  }
 
  
  const express = require("express");
  const app = express();
  const mongoose = require("mongoose");
  const path = require("path");
  const methodOverride = require("method-override");
  const ejsMate = require('ejs-mate');
  const ExpressError = require("./utils/ExpressError.js");
  const reviewRouter = require("./routes/review.js");
  const listingRouter = require("./routes/listing.js");
  const userRouter = require("./routes/user.js");
  const session = require("express-session");
  const MongoStore=require('connect-mongo');
  const flash = require("connect-flash");
  const passport = require("passport");
  const LocalStrategy = require("passport-local");
  const User = require("./models/user.js");

  const dbUrl=process.env.ATLASDB_URL;
  const store =MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
      secret:process.env.secret
    },
    touchAfter:24*3600,
  });
  store.on("error",(err)=>{
    console.log("error in mongo session store",err);
  })
  const sessionOptions = { 
    store,
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  };


  app.engine("ejs", ejsMate);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session(sessionOptions));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
res.locals.url = req.originalUrl || https://wanderlust-yhnd.onrender.com;
    console.log(req.originalUrl);
    next();
  });
  
 
  app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
  });
  
  app.use("/listings", listingRouter);
  app.use("/listings/:id/reviews", reviewRouter);
  app.use("/", userRouter);
  
  main()
    .then(() => {
      console.log("connected to DB");
    })
    .catch((err) => {
      console.log(err);
    });
  
  async function main() {
    await mongoose.connect(dbUrl);
  }
  
  app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
  });
  
  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error.ejs", { message: err.message });
  });
  
  app.listen(8080, () => {
    console.log("server is listening to port 8080");
  });
  
