const express = require('express');
const router = express.Router();
let nodemailer = require('nodemailer');

const Listing = require('../models/Listing.js');
const User = require("../models/User");



router.get('/my-posted-listings', (req, res, next) => {

    let currentUser;

    // if the current user is logged in, retrives the list of posted listings
    if (req.session.currentUser) {
        currentUser = req.session.currentUser;
        User.find({
                _id: currentUser._id,
            })
            .populate('createdListings')
            .then(selectedUser => {

                res.render('private/my-posted-listings', {
                    listings: selectedUser[0].createdListings,
                    currentUser
                });
            });
    } else {
        res.redirect('/login');
    }


});

router.get('/my-wanted-listings', (req, res, next) => {

    let currentUser;

    // if the current user is logged in, retrives the list of wanted listings
    if (req.session.currentUser) {
        currentUser = req.session.currentUser;
        User.find({
                _id: currentUser._id,
            })
            .populate('likedListings')
            .then(selectedUser => {
                res.render('private/my-wanted-listings', {
                    listings: selectedUser[0].likedListings,
                    currentUser
                });
            });
    } else {
        res.redirect('/login');
    }
});

// router.get('/notifications', (req, res, next) => {
//     let currentUser = req.session.currentUser;

//     if (req.session.currentUser) {
//         User.find({
//                 _id: currentUser._id,
//             })
//             .populate({
//                 path: 'listingsToGive',
//                 populate: {
//                     path: 'wantedBy'
//                 }
//             })
//             .then(selectedUser => {
//                 res.render('private/notifications', {
//                     listings: selectedUser[0].listingsToGive,
//                     currentUser
//                 });
//             });
//     } else {
//         res.redirect('/login');
//     }

// });


// POST request to 'want' listing
router.post('/listings/:listingId/wanted', (req, res, next) => {

    const listingId = req.params.listingId;
    let currentUser;

    // If user is not logged in, shows an error message
    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    } else {
        Listing.findById(listingId)
            .populate("author")
            .then((retrievedListing) => {

                res.render("listings/description", {
                    listing: retrievedListing,
                    currentUser: currentUser,
                    wantedCount: retrievedListing.wantedBy.length,
                    errorMessage: "User needs to login in order to perform this operation"
                });
                return;
            });
    }

    // looks for the listing document that the current user is visiting, and populates its 'author' attribute to use it later
    Listing.findById(listingId)
        .populate('author')
        .then(foundListing => {
            User.findById(currentUser)
                .then((userIFound) => {

                    // If already wanted the item, removes the element from the array of the user, from the array of the author and from the array of the listings and redirects to the listing description
                    if (userIFound.likedListings.includes(listingId)) {

                        // removing listing id from current user's wanted listings
                        User.updateOne({
                            _id: currentUser
                        }, {
                            $pullAll: {
                                likedListings: [listingId]
                            }
                        }).then(() => {

                            // removing listing id from author's listings to give
                            User.updateOne({
                                _id: foundListing.author
                            }, {
                                $pullAll: {
                                    listingsToGive: [listingId]
                                }
                            }).then(() => {

                                // removing current user id from listing's users
                                Listing.updateOne({
                                    _id: listingId
                                }, {
                                    $pullAll: {
                                        wantedBy: [currentUser]
                                    }
                                }).then(() => {
                                    res.redirect(`/listings/${listingId}`);
                                });
                            });
                        });
                        return;
                    }

                    // prevent listing author to want their own item
                    if (userIFound.createdListings.includes(listingId)) {
                        console.log('You cannot want an object that you created');
                        res.redirect(`/listings/${listingId}`);
                        return;
                    } else {
                        // if the user doesn't want the item already, pushes the listing Id to the likedListings of the currentuser array
                        User.update({
                                _id: currentUser
                            }, {
                                $push: {
                                    likedListings: listingId
                                }
                            }).then(() => {
                                // ...then pushes the current user id to the wantedby array of the listing document
                                Listing.findOneAndUpdate({
                                        _id: listingId
                                    }, {
                                        $push: {
                                            wantedBy: currentUser
                                        }
                                    })
                                    .populate('author')
                                    .then(foundListing => {
                                        // ...lastly, pushes the wanted listing into author's listingsToGive array and redirects the user to the listing description page - the wantedby count should be +1
                                        User.update({
                                                _id: foundListing.author._id
                                            }, {
                                                $push: {
                                                    listingsToGive: foundListing._id
                                                }
                                            })
                                            .then(() => {
                                                res.redirect(`/listings/${listingId}`);
                                            });
                                    });
                            })
                            .catch(err => console.log(err));
                    }
                });
        });
});

router.post('/send-email/:receiverId', (req, res, next) => {
    const receiverId = req.params.receiverId;
    const message = `<p>message sent by ${req.session.currentUser.username}</p><p>${req.body.message}</p>`;
    let sendToAddress;
    User.findById(receiverId)
        .then((foundUser) => {
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.ETH_EMAIL_ADDRESS, // generated ethereal user
                    pass: process.env.ETH_EMAIL_PASSWORD // generated ethereal password
                }
            });
            sendToAddress = foundUser.email;

            const mailOptions = {
                from: req.session.currentUser.email, // sender address
                to: sendToAddress, // list of receivers
                subject: `'[BRAND-NAME] You received a new email from ${req.session.currentUser.username}!`, // Subject line
                html: message // plain text body
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('The email I sent: ',info);
                    // adds contacted user to the list of contacted users
                    User.findByIdAndUpdate(req.session.currentUser._id, {
                        $push: {
                            contactedUsers: receiverId
                        }
                    }).then((updatedUser) => {
                        console.log('The user I updated: ',updatedUser);
                        res.redirect(`/listings/`);
                    }).catch(err=>console.log(err));
                }
            });
        });
});

// POST request to set item as given away
router.post('/listings/:listingId/given-away', (req, res, next) => {

    const listingId = req.params.listingId;
    let currentUser;

    // If user is not logged in, redirects to root
    if (req.session.currentUser) {
        currentUser = req.session.currentUser._id;
    } else {
        res.redirect('/');
    }

    Listing.findById(listingId)
        .populate('author')
        .then(currentListing => {

            // checks if currentuser is author. if it's not, rejects operation and redirects to listings
            if (currentUser != currentListing.author._id) {
                res.redirect('/listings');
            }

            // checks if the currentListing has already been given away. 
            if (!currentListing.givenAway) {
                // if it's not given away, we need to set as true the listing's givenAway property
                Listing.findByIdAndUpdate(listingId, {
                        givenAway: true
                    })
                    // and then pull the listing id from the user's listingsToGive property, if present
                    .then(() => {
                        User.findByIdAndUpdate(currentUser, {
                            $pullAll: {
                                listingsToGive: [listingId]
                            }
                        }).then(() => {
                            //lastly, redirect the user to the listing description page
                            res.redirect(`/listings/${listingId}`);
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
            } else {
                // if the listing has already been given away, we need to set as false the listing's givenAway property
                Listing.findByIdAndUpdate(listingId, {
                        givenAway: false
                    })
                    // then, check if other users are still wanting this listing
                    .then(() => {
                        User.find({
                            likedListings: listingId
                        }).then(foundUsers => {
                            // if the array of users contains something, we'll push back the listing to the listingsToGive user's property
                            if (foundUsers || foundUsers.length) {
                                User.findByIdAndUpdate(currentUser, {
                                    $push: {
                                        listingsToGive: listingId
                                    }
                                }).then(() => {
                                    //lastly, redirect the user to the listing description page
                                    res.redirect(`/listings/${listingId}`);
                                }).catch(err => console.log(err));
                            } else {
                                // if there were no users that previously wanted the item there won't be any need to push it back. We'll just redirect to listing description
                                res.redirect(`/listings/${listingId}`);
                            }
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
});



module.exports = router;