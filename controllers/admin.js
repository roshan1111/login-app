//load login

const { comparePassword, securePassword } = require("../config/securePassword");
const { User } = require("../models/users");
const { getRandomString } = require("../utility/generateToken");
const { sendResetEmail } = require("../utility/admin/sendResetPassword");
const { sendVerificationEmail } = require("../utility/sendVerificationEmail");

const loadadminLogin = async (req, res) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//get login data and login
const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(req.body)
    //checking if form email is existing on database or not
    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const isMatched = await comparePassword(password, adminData.password);
      if (isMatched) {
        if (adminData.isVerify) {
          //creating session for valid user
          //needed seesion id so setting session id as userdata.id
          req.session.adminId = adminData._id;
          res.redirect("/admin/home");
        } else {
          res
            .status(404)
            .render("/admin/login", { message: "please verify email first" });
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

//load admin home page
const loadAdminHome = async (req, res) => {
  const adminData = await User.findById({ _id: req.session.adminId });
  try {
    res.status(200).render("home", { adminData });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).redirect("/admin/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadResetPasswords = async (req, res) => {
  try {
    res.status(200).render("resetPassword");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const resetPasswords = async (req, res) => {
  try {
    const email = req.body.email;

    const adminData = await User.findOne({ email: email });
    // console.log(email);
    if (adminData) {
      if (adminData.isVerify) {
        const token = getRandomString();

        await User.updateOne(
          { email: email },
          {
            $set: {
              token: token,
            },
          }
        );
        sendResetEmail(adminData.name, adminData.email, adminData.id, token);

        res.render("resetPassword", {
          message: "please please check your email",
        });
      } else {
        res.render("resetPassword", { message: "please verify the email" });
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
//get token clicked from email link
const loadMailToken = async (req, res) => {
  try {
    const token = req.query.token;
    const adminData = await User.findOne({ token: token });
    if (adminData) {
      res.render("adminPasswordReset", { adminId: adminData._id });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const updateToken = async (req, res) => {
  try {
    const adminId = req.body.adminId;
    const password = req.body.password;
    const hashPassword = await securePassword(password);

    await User.findByIdAndUpdate(
      { _id: adminId },
      {
        $set: {
          password: hashPassword,
          token: "",
        },
      }
    );
    res.redirect("/admin/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//load dashboard

const loadDashboard = async (req, res) => {
  try {
//getting value of search (if there is value then it is stored in search else search is empty "")
let search = req.query.search ? req.query.search : "";
console.log
    //setting default value for pagination
    const { page = 1, limit = 2 } = req.query;

    //counting total records
    const totalUser = await User.find({ isAdmin: 0,
        //counting total user after search
       $or:[
            //regular expression of mongodb: .* = any value either in front or back  is used instead of .* 
            //for eg. search = test then if i enter roshantestroshan it will search test  
            // i = case sensative
            {name: {$regex: ".*" + search + ".*", $options: "i"}},
            {name: {$regex: ".*" + search + ".*", $options: "i"}},

        ]
     }).countDocuments();
    // console.log(totalUser)
    //get all the data except admin i.e:0 (for pagination limit = limit, skip = current page -1 = previous page)
    const userData = await User.find({ isAdmin: 0,
        $or:[
            //regular expression of mongodb: .* = any value either in front or back  is used instead of .* 
            //for eg. search = test then if i enter roshantestroshan it will search test  
            // i = case sensative
            {name: {$regex: ".*" + search + ".*", $options: "i"}},
            {name: {$regex: ".*" + search + ".*", $options: "i"}},

        ]
     })
      .limit(limit)
      .skip((page - 1) * limit);
    //sending user data in views

    res.status(200).render("dashboard", {
      userData: userData,
      totalPages: Math.ceil(totalUser / limit),
      currentPage: page,
      prevPage: page - 1,
      nextPage: Number(page) + 1,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadAddUser = async (req, res) => {
  try {
    res.status(200).render("addUser");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

//load edit user view and sending userData to views
const editUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const userData = await User.findOne({ _id: userId });
    if (userData) {
      res.status(200).render("editUser", { userData: userData });
    } else {
      res.status(200).redirect("/admin/home");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
//edit and Update user
const editUpdate = async (req, res) => {
  try {
    const userId = req.body.userId;
    const email = req.body.email;
    const name = req.body.name;
    const image = req.file.filename;
    const isverify = req.body.verify;

    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            email: email,
            name: name,
            image: image,
            isVerify: isverify,
          },
        }
      );
      if (userData) {
        res.status(200).redirect("/admin/dashboard");
      } else {
        res.status(404).send({
          message: "user with id doesnt edit",
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.query.id;

    const userData = await User.findByIdAndDelete({ _id: userId });
    //if its deleted
    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.send("user not deleted");
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const addUser = async (req, res) => {
  try {
    const password = req.body.password;
    const hashPassword = await securePassword(password);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      image: req.file.filename,
      isAdmin: req.body.isAdmin,
    });

    const saveduser = await newUser.save();
    if (saveduser) {
      sendVerificationEmail(saveduser.name, saveduser.email, saveduser._id);
      res.status(201).render("addUser", {
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

module.exports = {
  loadadminLogin,
  adminLogin,
  loadAdminHome,
  adminLogout,
  loadResetPasswords,
  resetPasswords,
  loadMailToken,
  updateToken,
  loadDashboard,
  loadAddUser,
  editUser,
  deleteUser,
  addUser,
  editUpdate,
};
