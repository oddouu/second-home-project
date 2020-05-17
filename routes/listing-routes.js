const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.js');

const Listing = require('../models/Listing.js');
const User = require("../models/User");


// GET request to create new listing form
router.get("/listings/add", (req, res) => {
    const currentUser = req.session.currentUser;

    res.render("listings/create", {
        currentUser,
        createForm: true
    });
});


// GET request to get all listings
router.get('/listings', (req, res) => {
    let currentUser;

    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    }


    Listing.find()
        .populate('author')
        .then(allListings => {

            // console.log('all listings',allListings);

            allListings.forEach((listing) => {
                if (listing.author._id == currentUser) {
                    listing.isAuthor = true;
                }
            });

            res.render('listings/all-listings', {
                listings: allListings,
                currentUser
            });
        });
    // add catch?
});

// GET form to edit existing listing
router.get('/listings/:listingId/edit', (req, res) => {
    const listingId = req.params.listingId;
    const user = req.session.currentUser._id;

    Listing.findById(listingId)
        .then((retrievedListing) => {
            res.render('listings/edit', {
                listing: retrievedListing,
                currentUser: user
            });
        });
});

// GET listing description
router.get("/listings/:listingId", (req, res) => {
    const listingId = req.params.listingId;
    let currentUser;
    let isCreator;
    let IsWantedByCurrentUser;

    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    }

    Listing.findById(listingId)
        .populate("author")
        .then((retrievedListing) => {
            if (retrievedListing.author._id == currentUser) {
                isCreator = true;
            }
            if (currentUser) {
                User.findById(currentUser)
                    .then((userIFound) => {

                        if (userIFound.likedListings.includes(listingId)) {
                            IsWantedByCurrentUser = true;
                        }

                        res.render("listings/description", {
                            listing: retrievedListing,
                            isCreator: isCreator,
                            currentUser: currentUser,
                            // GET WANTED COUNT
                            wantedCount: retrievedListing.wantedBy.length,
                            IsWantedByCurrentUser
                        });
                        return;
                    });
            }
        });
});


// POST add new listing
router.post('/listings/add', uploadCloud.single('image'), (req, res) => {
    const {
        name,
        description,
        listingType,
        location,
        lat,
        lng,
        category,
        subCategory
    } = req.body;


    const author = req.session.currentUser._id;
    // console.log(author);

    let imgPath;
    let imgName;

     if (req.file) {
         imgPath = req.file.url;
         imgName = req.file.originalname;

     } else {
         imgPath = '/images/corgiswimflip.gif';
         imgName = 'default';
     }

    const newListing = new Listing({
        name,
        description,
        listingType,
        author,
        imgPath,
        imgName,
        location,
        lat,
        lng,
        category,
        subCategory
    });


    Listing.create(newListing)
        .then((createdListing) => {

            User.update({
                    _id: author
                }, {
                    $push: {
                        createdListings: createdListing._id
                    }
                })
                .then(() => {
                    // once the item has been created, redirects the user to the item description page. How do I pass a success message in this case?
                    res.redirect(`/listings/${createdListing._id}`);
                });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/listings/add');
        });

});

// DELETE selected listing
router.post('/listings/:listingId/delete', (req, res) => {

    let listingId = req.params.listingId;
    const currentUser = req.session.currentUser._id;


    // Removes the listing id from the listing author's createdListings and listingsToGive arrays. 
    // then, removes the id from the likedListings array of the user that wanted this item and notifies them.
    // lastly, deletes the listing document and redirects the current user to the root.


    // removing listing id from current user's created listings
    User.updateOne({
        _id: currentUser
    }, {
        $pullAll: {
            createdListings: [listingId]
        }
    }).then(() => {

        // removing listing id from current user's listings to give
        User.updateOne({
            _id: currentUser
        }, {
            $pullAll: {
                listingsToGive: [listingId]
            }
        }).then(() => {

            // removing listing id from listing's users that liked it
            User.updateMany({
                likedListings: listingId
            }, {
                $pullAll: {
                    likedListings: [listingId]
                }
            }).then(() => {

                // NOTIFY USERS ???

                // delete the listing for real

                Listing.findByIdAndRemove(listingId)
                    .then(() => {
                        res.redirect(`/`);


                    }).catch((err) => console.log(err));
            }).catch((err) => console.log(err));
        }).catch((err) => console.log(err));
    }).catch((err) => console.log(err));
});

// POST edit existing listing

// edit existing listing should be done only by user that posted the listing or admin
router.post('/listings/:listingId/edit', (req, res) => {
    const listingId = req.params.listingId;
    let author = req.session.currentUser._id;


    const {
        name,
        description,
        listingType,
        location,
        lat,
        lng,
        category,
        subCategory
    } = req.body;

    const updatedListing = {
        name,
        description,
        listingType,
        author,
        location,
        lat,
        lng,
        category,
        subCategory
    };

    Listing.findById(listingId)
        .populate('author')
        .then((foundListing) => {

            if (foundListing.author._id == author) {

                isCreator = true;
                Listing.update({
                        _id: listingId
                    }, updatedListing)

                    .then(() => {
                        res.redirect(`/listings/${listingId}`);
                    })
                    .catch((err) => console.log(err));
            } else {
                res.redirect('/'); //if not author, redirects user to root
            }
        })
        .catch((err) => console.log(err));


});


router.post('/listings/:listingId/edit-picture', uploadCloud.single('image'), (req, res) => {
    const author = req.session.currentUser._id;
    const listingId = req.params.listingId;

    const imgPath = req.file.url;
    const imgName = req.file.originalname;

    const updatedListing = {
        imgPath,
        imgName
    };

    Listing.findById(listingId)
        .populate('author')
        .then((foundListing) => {

            if (foundListing.author._id == author) {

                isCreator = true;
                Listing.update({
                        _id: listingId
                    }, updatedListing)

                    .then(() => {
                        res.redirect(`/listings/${listingId}`);
                    })
                    .catch((err) => console.log(err));
            } else {
                res.redirect('/'); //if not author, redirects user to root
            }
        })
        .catch((err) => console.log(err));


});



module.exports = router;