const express = require('express');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const validator = require("validator");
const jwt = require("jsonwebtoken");


const {cleanupAndValidate,genrateJWTToken,sendVerificationToken,} = require("./utils/authUtils");
const userModel = require("./Models/userModel")
const createBookModel = require("./Models/createBookModel")
const { isAuth } = require("./middlewares/isAuthmiddleware");

// variable
const app = express();
const SECRETKEY = "This is for jwt node";
const PORT = process.env.PORT || 8000
const MONGO_URI =   `mongodb+srv://kunal_1234:1234@cluster0.ukgdobk.mongodb.net/library_DB`
const saltRound = 9;
const store = new mongoDbSession({
    uri: MONGO_URI,
    collection: "sessions",
  });
app.use(express.static("public"));

app.set("view engine",'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      secret: "This is our april nodejs class",
      resave: false,
      saveUninitialized: false,
      store: store,
    }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDb Connected");
  })
  .catch((error) => {
    console.log(error);
  });


app.get('/', (req, res) => {
    res.render('home'); 
})

app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', async(req, res) => {
    console.log(req.body);
    const { name, email, password, username, phone } = req.body;
    try {
        await cleanupAndValidate({ email, name, password, username, phone});
      } catch (error) {
        return res.send({
          status: 400,
          message: error.message,
          error: error,
        });
      }
       //check is the email exits or not in Db;
  const userObjEmailExits = await userModel.findOne({ email });
  console.log(userObjEmailExits);

  if (userObjEmailExits) {
    return res.send({
      status: 400,
      message: "Email Already Exits",
    });
  }

  //check is the username exits or not in Db;
  const userObjUsernameExits = await userModel.findOne({ username });
  console.log(userObjUsernameExits);

  if (userObjUsernameExits) {
    return res.send({
      status: 400,
      message: "Username Already Exits",
    });
  }

  //password hashing
  const hashedPassword = await bcrypt.hash(password, saltRound);

  //Create userObj
  const userObj = new userModel({
    //key:value
    name: name,
    email: email,
    phone: phone,
    password: hashedPassword,
    username: username
  });

    //genrate token
    const token = genrateJWTToken(email);
    console.log(token);

  try {
    const userDb = await userObj.save();
    sendVerificationToken({ token, email });
    return res.send({
      status: 200,
      message: "Please verify your mail id before login",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database Error",
      error: error,
    });
  }
})

app.get('/login',  (req, res) => {
    res.render('login')
})

app.post("/login", async (req, res) => {
    //console.log(req.body);
    const { loginId, password } = req.body;
    //Data validation
  
    if (!loginId || !password) {
      return res.send({
        status: 400,
        message: "Missing credentials",
      });
    }
  
    if (typeof loginId !== "string" || typeof password !== "string") {
      return res.send({
        status: 400,
        message: "Invalid Data Format",
      });
    }
  
    //find the user obj from loginId
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await userModel.findOne({ email: loginId });
    } else {
      userDb = await userModel.findOne({ username: loginId });
    }
    // console.log(userDb);
    if (!userDb) {
      return res.send({
        status: 400,
        message: "User does not exist, Please register first",
      });
    }
  

      //eamilAuthenticated or not
  if (userDb.emailAuthenticated === false) {
    return res.send({
      status: 400,
      message: "Please verfiy your email first",
    });
  }

    //compare the password
  
    const isMatch = await bcrypt.compare(password, userDb.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password incorrect",
      });
    }

    //successfull login
  
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.name,
      email: userDb.email,
      userId: userDb._id,
    };
  
    return res.redirect("/dashboard");
  });

  app.get("/api/:id", isAuth, async (req, res) => {
    console.log(req.params);
    const token = req.params.id;
  
    jwt.verify(token, SECRETKEY, async (err, decoded) => {
      console.log(decoded);
      try {
        await userModel.findOneAndUpdate(
          { email: decoded },
          { emailAuthenticated: true }
        );
  
        return res.redirect("/login");
      } catch (error) {
        return res.send({
          status: 500,
          message: "Email Authentication Failed",
        });
      }
  
      return res.send(true);
    });
  });



  app.post("/logout", isAuth, (req, res) => {
    req.session.destroy((error) => {
      if (error) throw error;
      return res.redirect("/login");
    });
  });
  
  app.post("/logout_from_all_devices",isAuth, async (req, res) => {
    console.log(req.session.user.userId);
    const username = req.session.user.username;
    //create session schema
    const Schema = mongoose.Schema;
    const sessionSchema = new Schema({ _id: String }, { strict: false });
    const sessionModel = mongoose.model("session", sessionSchema);
  
    try {
      const deleteDb = await sessionModel.deleteMany({
        "session.user.username": username,
      });
      console.log(deleteDb);
      return res.redirect("/login");
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  
    // return res.send(true);
  });

 
  app.get("/create-book",(req,res)=>{
    res.render("createbook",)
  })

  app.post('/create-book',isAuth, async(req,res)=>{
    //  console.log(req.session.user.userId)
    // console.log(req.body.bookData)
     const { bookTitle, bookPrice, bookAuther, bookCategory } = req.body.bookData;
      console.log(bookTitle,bookPrice,bookAuther,bookCategory)
    if(!bookTitle && !bookPrice && !bookAuther && !bookCategory){
      return res.send({
        status: 400,
        message: "Missing Fields",
      });
    }
     const bookObj = new createBookModel({
      //key:value
      bookAddBy: req.session.user.email,
      bookTitle: bookTitle,
      bookPrice: bookPrice,
      bookAuther: bookAuther,
      bookCategory: bookCategory
    });

    try {
      const bookDb = await bookObj.save();
      return res.send({
        status: 200,
        message: "Book Saved Succesfull",
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database Error",
        error: error,
      });
    }
  });

  app.get('/books', isAuth, async(req, res) => { 
     bookDb = await createBookModel.find()
    res.send(bookDb);
  });


  app.get('/dashboard', isAuth,(req, res) =>{
    res.render('dashboard')
})


app.listen(PORT,()=>{
    console.log(`listening on port  ${PORT}`)
})

