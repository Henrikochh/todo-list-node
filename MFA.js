const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMfaCode(to, code) {
    const msg = {
        to: to,
        from: 'mail@valentin-nussbaumer.com', // Replace with your verified sender
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
        throw new Error('Could not send MFA code.');
    }
}

module.exports = { sendMfaCode };