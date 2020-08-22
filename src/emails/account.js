const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRIDAPIKEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dskelton@pm.me',
        subject: 'Welcome to the Task Manager App!',
        text: `Hello ${name}, welcome to the task manager app! Let me know if you have any issues or suggestions.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dskelton@pm.me',
        subject: 'Task Manager App Account Canceltation.',
        text: `Hello ${name}, we're sorry to see you go. Please respond to this email with any feedback you have on the service.`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
};