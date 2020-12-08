/**
 * config
 */
const config = require('config');
const apiKey = config.get('mailgun.apiKey');
const domain = config.get('mailgun.domain');

/**
 * mailgun
 */
const mailgun = require("mailgun-js")({apiKey, domain});

const fs = require('fs');

module.exports = {
  sendWelcomeEmail(email, firstName, username) {
    const onlyinstaLogo = fs.createReadStream('./onlyinsta-logo.png');
    const data = {
      from: 'hello@mail.onlyinsta.com',
      to: email,
      subject: "Welcome to OnlyInsta!",
      inline: [onlyinstaLogo],
      template: 'welcome-to-onlyinsta',
      'v:user_first_name': firstName,
      'v:user_onlyinsta_profile_link': `OnlyInsta.com/${username}`,
    };

    return mailgun.messages().send(data);
  },
  sendNewSubscriberEmail(email, firstName) {
    const onlyinstaLogo = fs.createReadStream('./onlyinsta-logo.png');
    const data = {
      from: 'hello@mail.onlyinsta.com',
      to: email,
      subject: "You have a new subscriber.",
      inline: [onlyinstaLogo],
      template: 'new-subscriber',
      'v:user_first_name': firstName,
    };

    return mailgun.messages().send(data);
  },
  // sendSharedCardEmail(to, data) {
  //   return mailgun.messages().send({
  //     from: 'Split - Virtual debit cards <example@example.com>',
  //     to,
  //     subject: "A virtual debit card has been shared with you!",
  //     template: 'card-sharing-email',
  //     'v:customer_name': data.customerName,
  //     'v:cardholder_name': data.cardholderName,
  //     'v:link_to_card': data.linkToCard,
  //   });
  // }
};
