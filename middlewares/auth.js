const isLoggedin = async (req, res, next) => {
  try {
    if (req.session.userID) {
    } else {
      //the purpose of return is to return login page and ignore next i.e. homepage
      return res.redirect("/login");
    }
    //go to next i.e. homepage
    next();
  } catch (error) {
    console.log(error);
  }
};

const isLoggedout = async (req, res, next) => {
  try {
    if (req.session.userID) {
      return res.redirect("/home");
    }
    //go to next i.e. homepage
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isLoggedin, isLoggedout };
