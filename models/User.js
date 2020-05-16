const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    username: String,
    password: String,
    location: String,
   /*  role: String, 
    googleID: String,  */

    // add a foreign ID
    likedListings: [{
        type: Schema.Types.ObjectId, // grabbing the author id of person who is creating listing, from author collection
        ref: 'Listing' // also add admin. version 
    }],

    createdListings: [{
        type: Schema.Types.ObjectId, // grabbing the author id of person who is creating listing, from author collection
            ref: 'Listing' // also add admin. version 
    }],

    listingsToGive: [{
        type: Schema.Types.ObjectId, // grabbing the author id of person who is creating listing, from author collection
        ref: 'Listing' // also add admin. version 
    }],

    //will we need to extend the listing id as well, in order to have an array of what listings the offer has separate between "want" and "offer"[ing] as well? Default should be an empty array with a reference to listings collection, and specifically items with the same author id...
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;