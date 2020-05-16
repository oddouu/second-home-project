const express = require('express');
const router = express.Router();


router.get("/", (req, res, next) => {
  let currentUser; 
  
  if (req.session.currentUser) {
    currentUser = req.session.currentUser;
  }

   // Getting username from passport
  //  if (req.session.passport) {
  //   currentUser = req.session.passport.user.username;
  // }

  res.render("index", {
    currentUser,
  });
});

// router.use => middleware
router.use((req, res, next) => {
  if (req.session.currentUser /* || req.session.passport */) {
    //next here redirects the user to the next rout in line (=> secret rout here)
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
