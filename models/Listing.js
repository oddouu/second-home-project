const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
        name: {
            type: String,
        },

        description: {
            type: String,
        },
        // add a foreign ID
        author: {
            type: Schema.Types.ObjectId, // grabbing the author id of the person who is creating listing, from author collection
            ref: 'User' // also add admin. version 
        },

        wantedBy: [{
            type: Schema.Types.ObjectId, // grabbing the author id of the person who is creating listing, from author collection
            ref: 'User' // also add admin. version 
        }],

        listingType: {
            type: String,
            enum: ['Offer', 'Want']
        },

        imgName: {
            type: String, // what if we wanted to upload multiple pictures? more likely the case, [String]
            default: 'public/images/corgiswimflip.gif'
        },

        imgPath: {
            type: String, // 
        },

        location: {
            type: String, // future API call
        },

        category: {
            type: String,
        },

        subCategory: {
            type: String,
        }
    
   }, {
       timestamps: {
           createdAt: 'created_at',
           updatedAt: 'updated_at'
       }
   });

const Listing = mongoose.model('Listing', listingSchema);

// exports module in order to use it on the route
module.exports = Listing;