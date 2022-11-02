const isLoggedin = async (req, res, next) => {
    try {
      if (req.session.adminId) {
      } else {
        //the purpose of return is to return login page and ignore next i.e. homepage
        return res.redirect("/admin/login");
      }
      //go to next i.e. homepage
      next();
    } catch (error) {
      console.log(error);
    }
  };
  
  const isLoggedout = async (req, res, next) => {
    try {
      if (req.session.adminId) {
        return res.redirect("/admin/home");
      }
      //go to next i.e. homepage
      next();
    } catch (error) {
      console.log(error);
    }
  };
  
  module.exports = { isLoggedin, isLoggedout };
  