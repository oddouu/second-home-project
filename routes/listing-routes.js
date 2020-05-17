const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.js');

const Listing = require('../models/Listing.js');
const User = require("../models/User");


// GET request to create new listing form
router.get("/listings/add", (req, res) => {
    const currentUser = req.session.currentUser;

    res.render("listings/create", {
        currentUser
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

    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    }

    Listing.findById(listingId)
        .populate("author")
        .then((retrievedListing) => {
            if (retrievedListing.author._id == currentUser) {
                isCreator = true;
            }

            res.render("listings/description", {
                listing: retrievedListing,
                isCreator: isCreator,
                currentUser: currentUser,
                // GET WANTED COUNT
                wantedCount: retrievedListing.wantedBy.length
            });
            return;
        });
});


// POST add new listing
router.post('/listings/add', uploadCloud.single('image'), (req, res) => {
    const {
        name,
        description,
        listingType,
        location,
        category,
        subCategory
    } = req.body;

    const author = req.session.currentUser._id;
    // console.log(author);

    const imgPath = req.file.url;
    const imgName = req.file.originalname;

    const newListing = new Listing({
        name,
        description,
        listingType,
        author,
        imgPath,
        imgName,
        location,
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
    const user = req.session.currentUser._id;
    let isCreator;

    Listing.findById(listingId)
        .populate('author')
        .then((foundListing) => {

            if (foundListing.author._id == user) {

                isCreator = true;
                Listing.findByIdAndRemove(listingId)
                    .then(() => {
                        User.updateMany({
                                likedListings: {
                                    $in: [listingId]
                                },
                                createdListings: {
                                    $in: [listingId]
                                },
                                listingsToGive: {
                                    $in: [listingId]
                                }
                            }, {
                                $pull: {
                                    likedListings: listingId,
                                    createdListings: listingId,
                                    listingsToGive: listingId
                                }

                            })
                            .then(() => {
                                res.render("listings/description", {
                                    successMessage: 'The item has been successfully deleted!'
                                });

                            });

                    })
                    .catch((err) => console.log(err));
            } else {
                res.redirect('/'); //if not author, do something
            }
        })
        .catch((err) => console.log(err));


});

// POST edit existing listing

// edit existing listing should be done only by user that posted the listing or admin
router.post('/listings/:listingId/edit', uploadCloud.single('image'), (req, res) => {
    const listingId = req.params.listingId;

    let author = req.session.currentUser._id;
    console.log(author);

    let imgPath = req.file.url;
    let imgName = req.file.originalname;

    const {
        name,
        description,
        listingType,
        location
    } = req.body;

    const updatedListing = {
        name,
        description,
        listingType,
        author,
        imgPath,
        imgName,
        location
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
                        res.render('listings/edit', {
                            successMessage: 'Success!'
                        });
                    })
                    .catch((err) => console.log(err));
            } else {
                res.redirect('/'); //if not author, do something (pass an error message)
            }
        })
        .catch((err) => console.log(err));


});




module.exports = router;