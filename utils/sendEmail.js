/** @format */

const nodeMailer = require("nodemailer");
const catchAsync = require("./catchAsync");

const sendEmail = catchAsync(async (options) => {
  //Create an Transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Define the mail Options
  const mailOption = {
    from: "Onkar Pawar <onkarpawar010@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  //Send the Mail
  await transporter.sendMail(mailOption);
});

module.exports = sendEmail;
