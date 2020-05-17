const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
/* const passport = require('passport'); */
const User = require("../models/User");
const uploadCloud = require('../config/cloudinary.js');


/* router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/" // here you would redirect to the login page using traditional login approach
    })
  );
 */

// GET ROUTES
router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});

router.get("/login", (req, res, next) => {
    res.render("auth/login");
});


// router.get("/signup", (req, res, next) => {
//     try {
//       res.render("auth/signup");
//     } catch(e) {
//       next(e);
//     }
//   });
  
//   router.get("/login", (req, res, next) => {
//     try {
//       res.render("auth/login");
//     } catch(e) {
//       next(e);
//     }
//   });
  
router.get("/logout", (req, res, next) => {
    /* req.logout(); */
    req.session.destroy(() => {
        res.redirect("/login");
    });
});


// POST ROUTES
router.post("/signup", uploadCloud.single('image'), (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const location = req.body.location;
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    let imgPath;
    let imgName;

    if (req.file) {
        imgPath = req.file.url;
        imgName = req.file.originalname;

    } else {
        imgPath = '/images/corgiswimflip.gif';
        imgName = 'default';
    }

    if (username === "" || password === "") {
        res.render("auth/signup", {
            errorMessage: "Indicate a username and password",
        });
        // the return here avoids us using else statement
        return;
    }

    User.findOne({
            username: username
        })
        .then((user) => {
            if (user !== null) {
                res.render("auth/signup", {
                    errorMessage: "The username already exists!",
                });
                return;
            }

            User.create({
                    username,
                    password: hashPass,
                    email: email,
                    location: location,
                    imgPath: imgPath,
                    imgName: imgName
                })
                .then(() => {
                    res.redirect("/");
                })
                .catch((error) => {
                    console.log(error);
                });
        })
        .catch((error) => {
            next(error);
        });
});

router.post("/login", (req, res, next) => {
    const theUsername = req.body.username;
    const thePassword = req.body.password;

    if (theUsername === "" || thePassword === "") {
        res.render("auth/login", {
            errorMessage: "Please enter both, username and password to sign up.",
        });
        return;
    }

    User.findOne({
            username: theUsername,
        })
        .then((user) => {
            if (!user) {
                res.render("auth/login", {
                    errorMessage: "Invalid login",
                });
                return;
            }
            if (bcrypt.compareSync(thePassword, user.password)) {
                // Save the login in the session!
                req.session.currentUser = user;
                /* req.session.passport */
                //if (req.session.currentUser) 
                res.redirect("/");
            } else {
                res.render("auth/login", {
                    errorMessage: "Invalid login",
                });
            }
        })
        .catch((error) => {
            next(error);
        });
});

module.exports = router;