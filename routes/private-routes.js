const express = require('express');
const router = express.Router();
let nodemailer = require('nodemailer');

const Listing = require('../models/Listing.js');
const User = require("../models/User");



router.get('/my-posted-listings', (req, res, next) => {
    let currentUser;
    if (req.session.currentUser) {
        currentUser = req.session.currentUser; // is this equal to object id???

        User.find({
                _id: currentUser._id,
            })
            .populate('createdListings')
            // console.log() what does liked listings consist of again???
            .then(selectedUser => {
                //console.log('HERE 1', selectedUser);
                //console.log('HERE 2', selectedUser[0].likedListings);
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
    let currentUser = req.session.currentUser; // is this equal to object id???


    if (req.session.currentUser) {
        User.find({
                _id: currentUser._id,
            })
            .populate('likedListings')
            .then(selectedUser => {
                //console.log('HERE 1', selectedUser);
                //console.log('HERE 2', selectedUser[0].likedListings);
                res.render('private/my-wanted-listings', {
                    listings: selectedUser[0].likedListings,
                    currentUser
                });
            });
    } else {
        res.redirect('/login');
    }

});

router.get('/notifications', (req, res, next) => {
    let currentUser = req.session.currentUser;

    if (req.session.currentUser) {
        User.find({
                _id: currentUser._id,
            })
            .populate({
                path: 'listingsToGive',
                populate: {
                    path: 'wantedBy'
                }
            })
            .then(selectedUser => {
                // console.log("users:", selectedUser[0].listingsToGive[0].wantedBy[0]);
                res.render('private/notifications', {
                    listings: selectedUser[0].listingsToGive,
                    currentUser
                });
            });
    } else {
        res.redirect('/login');
    }

});


// POST request to 'want' listing
router.post('/listings/:listingId/wanted', (req, res, next) => {

    const listingId = req.params.listingId;
    let currentUser;
    let isCreator;

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



    Listing.findById(listingId)
        .populate('author')
        .then(foundListing => {
            User.findById(currentUser)
                .then((userIFound) => {

                    if (foundListing.author._id == currentUser) {
                        isCreator = true;
                    }

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
                from: process.env.ETH_EMAIL_ADDRESS, // sender address
                to: sendToAddress, // list of receivers
                subject: `'[BRAND-NAME] You received a new email from ${req.session.currentUser.username}!`, // Subject line
                html: message // plain text body
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err);
                else
                    console.log(info);
            });

            res.render('private/notifications', {
                successMessage: 'your email was sent successfully',

            });
        });
});

module.exports = router;