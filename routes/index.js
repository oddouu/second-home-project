const express = require('express');
const router = express.Router();

const User = require("../models/User");
const Listing = require('../models/Listing.js');


router.get("/", (req, res, next) => {
  let currentUser;

 
  if (req.session.currentUser) {
    currentUser = req.session.currentUser;
  }

  Listing.find()
         .then((ListingsArray)=>{
          
          // extracts available categories from listings in the Db
          const uniqueCategories = [...new Set(ListingsArray.map(data => data.category))];
           
          // passes categories to index view
           res.render("index", {
             currentUser,
             uniqueCategories : uniqueCategories
           });
         })
         .catch(err=>console.log(err));

  

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
