const express = require('express');
const router = express.Router();

const User = require("../models/User");
const Listing = require('../models/Listing.js');


router.get("/", (req, res, next) => {
  let currentUser;


  if (req.session.currentUser) {
    currentUser = req.session.currentUser;
    console.log('============>', req.session.currentUser)
  }

  Listing.find()
    .then((ListingsArray) => {

      // extracts available categories from listings in the Db
      const uniqueCategories = [...new Set(ListingsArray.map(data => data.category))];

      // passes categories to index view
      res.render("index", {
        currentUser,
        uniqueCategories: uniqueCategories,
        listings: ListingsArray
      });
    })
    .catch(err => console.log(err));



});

router.post('/:userId/destroy', (req, res, next) => {

  // Removes the user id from the wantedBy array of every listing in the db.
  // Destroys all the listings posted by the user.
  // Removes the user document from the db. 

  const userId = req.params.userId;

  if (req.session.currentUser) {
    if (req.session.currentUser._id == userId) {

      req.session.destroy(() => {

        Listing.updateMany({
            wantedBy: userId
          }, {
            $pullAll: {
              wantedBy: [userId]
            }
          })
          .populate('author')
          .then((updatedListings) => {
            console.log('updated listings: ', updatedListings);

            Listing.deleteMany({
                author: userId
              })
              .then((deleteListingsOperation) => {
                console.log('delete listings operation: ', deleteListingsOperation);

                User.findByIdAndDelete(userId)
                  .then((deleteUserOperation) => {
                    console.log(deleteUserOperation);
                    res.redirect('/');
                  });
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      });
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }



});

// router.use => middleware
router.use((req, res, next) => {
  if (req.session.currentUser /* || req.session.passport */ ) {
    //next here redirects the user to the next rout in line (=> secret rout here)
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports = router;