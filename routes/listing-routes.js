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


// GET request to get all listings (or listings filtered by category)
router.get('/listings', (req, res) => {
    let emptyMessage;
    let queryCategory = req.query.category;
    let queryType = req.query.listingType;
    let wantMessage;
    let offerMessage;
    let currentUser;

    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    }

    if (queryType === 'Want') {
        wantMessage = 'Feeling like making someone happy today? Have a look at what people is looking for.';
    } else if (queryType === 'Offer') {
        offerMessage = 'Satisfy your urge for free stuff. Check what people is giving away!';
    }

    Listing.find()
        .populate('author')
        .then(allListings => {

            //filters the array of objects based on the query in the url
            if (queryCategory) {
                allListings = allListings.filter(listing => listing.category === queryCategory);
            }

            if (queryType) {
                allListings = allListings.filter(listing => listing.listingType === queryType);
            }

            //checks if the current user is the listing's author. 
            //if it is, creates (and sets to true) the isAuthor property - which will be used on the view to conditionally render things
            allListings.forEach((listing) => {
                if (listing.author._id == currentUser) {
                    listing.isAuthor = true;
                }
            });

            if (allListings === undefined || allListings.length == 0) {
                emptyMessage = 'Wow, such empty.';
            }

            res.render('listings/all-listings', {
                listings: allListings,
                currentUser,
                queryCategory,
                queryType,
                emptyMessage,
                wantMessage,
                offerMessage
            });
        })
        .catch(err => console.log(err));
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
    } else {
        res.redirect('/login');
    }

    Listing.findById(listingId)
        .populate("author")
        .then((retrievedListing) => {
            if (retrievedListing.author._id == currentUser) {
                isCreator = true;
            }

            // calculate how many days ago the listing was created
            const today = new Date();
            const createdOn = new Date(retrievedListing.created_at);


            // takes time difference from listing's created_at and shows it in different time measures depending on how much time has passed (minutes, hours or days)
            const msInMinute = 60 * 1000;
            const msInHour = 60 * 60 * 1000;
            const msInDay = 24 * 60 * 60 * 1000;

            let diffInMs = (today - createdOn);
            let diff;
            let postedAgo;

            if (diffInMs >= 0 && diffInMs <= msInMinute) {
                postedAgo = 'Now';
            } else if (diffInMs <= msInHour) {
                diffInMs /= msInMinute;
                diff = Math.round(diffInMs);
                postedAgo = `${diff} minute(s) ago`;
            } else if (diffInMs <= msInDay) {
                diffInMs /= msInHour;
                diff = Math.round(diffInMs);
                postedAgo = `${diff} hour(s) ago`;
            } else {
                diffInMs /= msInDay;
                diff = Math.round(diffInMs);
                postedAgo = `${diff} day(s) ago`;
            }


            // checks if the current user already wants this listing, and depending on that does something on the 'description' view
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
                            IsWantedByCurrentUser,
                            postedAgo
                        });
                        return;
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
});


// POST add new listing
router.post('/listings/add', uploadCloud.single('image'), (req, res) => {

    const today = new Date();
    let pickupDate;
    let author;

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

    if (req.session.currentUser) {
        author = req.session.currentUser._id;

    }

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

    if (req.body.pickupDate) {
        pickupDate = new Date(req.body.pickupDate);
    } else {
        pickupDate = 'none';
    }


    const newListing = new Listing({
        name,
        description,
        listingType,
        pickupDate,
        author,
        imgPath,
        imgName,
        location,
        lat,
        lng,
        category,
        subCategory
    });

    console.log('========');
    console.log("PICKUPDATE: ", pickupDate);
    if (pickupDate)
        if (pickupDate >= today) {
            console.log('it is in the future!');
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
        } else {
            console.log('it is in the past');
            res.redirect('/listings/add');
        }
    console.log('========');


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