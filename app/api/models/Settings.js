// models/Settings.js

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Unique identifier (we only want one document)
    singletonId: {
        type: String,
        default: 'GLOBAL_SETTINGS',
        unique: true,
    },
    siteName: {
        type: String,
        default: 'Sportify',
        required: true,
        trim: true,
    },
    siteDescription: {
        type: String,
        default: 'Your one-stop shop for sports equipment',
        trim: true,
    },
    currency: {
        type: String,
        default: 'LKR', // Changed to LKR based on your frontend, but USD is fine too
        minlength: 3,
        maxlength: 3,
    },
    taxRate: {
        type: Number,
        default: 8,
        min: 0,
        max: 100,
    },
    shippingRates: {
        standard: { type: Number, default: 500 }, // Assuming LKR 500
        express: { type: Number, default: 1200 },
        overnight: { type: Number, default: 2500 },
    },
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0,
    },
    autoApproveSuppliers: {
        type: Boolean,
        default: false,
    },
    requireEmailVerification: {
        type: Boolean,
        default: true,
    },
    allowGuestCheckout: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Ensures the single document exists (initializes if collection is empty)
settingsSchema.statics.getGlobalSettings = async function() {
    let settings = await this.findOne({ singletonId: 'GLOBAL_SETTINGS' });
    if (!settings) {
        // Create the default document if it doesn't exist
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Setting', settingsSchema);