const { securePassword, comparePassword } = require("../config/securePassword");
const { User } = require("../models/users");
const { getRandomString } = require("../utility/generateToken");
const { sendResetEmail } = require("../utility/sendResetPassword");
const { sendVerificationEmail } = require("../utility/sendVerificationEmail");

//registration views page
const loadRegistration = async (req, res) => {
  try {
    res.status(200).render("registration");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//login views page
const loadLogin = async (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
//check if id and password match and redireect to home route
const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(req.body)
    //checking if form email is existing on database or not
    const userData = await User.findOne({ email: email });
    // console.log(userData);

    if (userData) {
      const isMatched = await comparePassword(password, userData.password);
      if (isMatched) {
        if (userData.isVerify) {
          //creating session for valid user
          //needed seesion id so setting session id as userdata.id
          req.session.userID = userData._id;
          res.redirect("/home");
        } else {
          res
            .status(404)
            .render("login", { message: "please verify email first" });
        }
      } else {
        res.status(404).send({ message: "email or password didnt match" });
      }
    } else {
      res
        .status(404)
        .send({ message: "user with email and password doesnt exist" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//load home page if id and password is match

const loadHome = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.userID });
    res.status(200).render("home", { userData });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//logout user

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//save registration users
const postRegistration = async (req, res) => {
  try {
    const password = req.body.password;
    const hashPassword = await securePassword(password);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      image: req.file.filename,
      isAdmin: 0,
    });

    const saveduser = await newUser.save();
    if (saveduser) {
      sendVerificationEmail(saveduser.name, saveduser.email, saveduser._id);
      res.status(201).render("registration", {
        message: "registration sucessful. Please verify email",
      });
    } else {
      res.status(404).send({ message: "route not found" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    //getting id from url
    const id = req.query.id;
    const verifiedUser = await User.updateOne(
      { _id: id },
      { $set: { isVerify: 1 } }
    );

    if (verifiedUser) {
      res.render("verification", { message: "verified" });
    } else {
      res.render("verification", { message: "oppss not verified" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadVerificationEmail = async (req, res) => {
  try {
    res.render("resendVerificationEmail");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email });
    if (userData) {
      if (userData.isVerify) {
        res.render("resendVerificationEmail", {
          message: "user is already verified",
        });
      } else {
        sendVerificationEmail(userData.name, userData.email, userData._id);
        res.render("resendVerificationEmail", {
          message: "verification link send",
        });
      }
    } else {
      res.render("resendVerificationEmail", { message: "not a valid user" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadResetPassword = async (req, res) => {
  try {
    res.render("resetPassword");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    userData = await User.findOne({ email });
    if (userData) {
      if (userData.isVerify) {
        //generate random string from getRandomString function
        const randomString = getRandomString();
        console.log(randomString);
        const updateToken = await User.updateOne(
          { email: email },
          {
            $set: {
              token: randomString,
            },
          }
        );
        sendResetEmail(
          userData.name,
          userData.email,
          userData.id,
          randomString
        );
        res.render("resetPassword", { message: "please check your email" });
      } else {
        res.render("resetPassword", {
          message: "first verify the email",
        });
      }
    } else {
      res.render("resetPassword", { message: "invalid user" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadToken = async (req, res) => {
  try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("resetView", { userId: userData._id });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resetToken = async (req, res) => {
  try {
    const password = req.body.password;
    const userId = req.body.userId;
    console.log(userId);
    const hashPassword = await securePassword(password);

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          password: hashPassword,
          token: "",
        },
      }
    );
    res.redirect("/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//edit profile
const loadEdit = async (req, res) => {
  try {
    //fetch the id from url
    const id = req.query.id;
    //get all data comparing db _id and url id
    const userData = await User.findById({ _id: id });
    if (userData) {
      //sending userData to edit page
      res.status(200).render("edit", { userData: userData });
    } else {
      res.status(200).redirect("/home");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const email = req.body.email;
    const name = req.body.name;
    const image = req.file.filename;
    //checking the field data from edit page
    console.log(req.body)

    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            email: email,
            name: name,
            image: image,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            email: email,
            name: name,
          },
        }
      );
    }

    res.redirect("/home");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};


// const deleteUser = async(req, res)=>{
//   const userId = req.query.id

//   console.log(userId)
//     try{
//       const userData = await User.findByIdAndDelete({_id: userId})
      



//     }
//     catch(error){
//         res.status(500).send({
//             message: error.message
//         })
//     }
// }

module.exports = {
  loadRegistration,
  postRegistration,
  loadLogin,
  loginUser,
  loadHome,
  logout,
  verifyEmail,
  loadVerificationEmail,
  resendVerificationEmail,
  loadResetPassword,
  resetPassword,
  loadToken,
  resetToken,
  loadEdit,
  editProfile,
  
};
