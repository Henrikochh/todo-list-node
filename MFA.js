const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// sgMail.setDataResidency('eu'); // Uncomment if you use the EU region for SendGrid

async function sendMfaCode(to, code) {
    const msg = {
        to: to, // The recipient's email address (which is the username)
        from: 'mail@valentin-nussbaumer.com', // A verified sender in your SendGrid account
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
        html: `<strong>Your verification code is: ${code}</strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log('MFA Email sent successfully.');
    } catch (error) {
        console.error('Error sending MFA email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        // Throw an error to be handled by the calling function
        throw new Error('Could not send MFA code.');
    }
}

module.exports = { sendMfaCode };