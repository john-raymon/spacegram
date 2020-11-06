const mongoose = require("mongoose");
const config = require("config");

const SubscriptionSchema = new mongoose.Schema(
  {
    subscriber: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priceInCents: Number,
    stripeChargeId: String,
    expires: Date,
    nonDestinationCharge: Boolean,
    hasBeenTransferred: Boolean,
    confirmationCode: { type: String, index: true },
    stripeTransferId: String,
  }
)

SubscriptionSchema.methods.getSubscriptionObject = function() {
  return {
    active: (this.expires > (new Date())),
    expires: this.expires,
    priceInCents: this.priceInCents,
    creator: this.creator,
    subscriber: this.subscriber,
    confirmationCode: this.confirmationCode,
  }
}

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;

