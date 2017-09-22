var express = require('express')
  , router = express.Router();


module.exports = function(passport){
  
  // MAIN PAGE //
  router.get("/", function(req, res){
    res.sendFile("views/main.html", {'root': '../app/'});
  });
  
  // LOG IN PAGE//
  router.get("/login", function(req, res){
    if (req.isAuthenticated()){
      res.redirect('home')
    } else {
      res.sendFile("views/login.html", {'root': '../app/'});   
    }
  });
  
  // REGISTRATION PAGE //
  router.get("/register", function(req, res){
    if (req.isAuthenticated()){
      res.redirect('home')
    } else {
      res.sendFile("views/register.html", {'root': '../app/'});
    }
  });
  
  // HOME PAGE // pass it only if user is authenticated
  router.get('/home', function(req, res){
    if (req.isAuthenticated()){
      res.sendFile("views/home.html", {'root': '../app/'});
    } else {
      res.redirect("/login");
    }
  });
  
  // SIGN UP REQUEST //
  router.post("/signup", passport.authenticate("signup", {
    successRedirect : "/home",
    failurRedirect : "/register"
  }))
  
  // LOG IN //
  router.post("/login", passport.authenticate("login", { 
    successRedirect : "/home",
    failureRedirect : "/login",
  }));
 
  // LOG OUT //
  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  })
  

  return router;
  
}