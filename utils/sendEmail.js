/** @format */

const nodeMailer = require("nodemailer");
const catchAsync = require("./catchAsync");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstname = user.name.split(" ")[0]),
      (this.url = url),
      (this.from = `Onkar Pawar <${process.env.EMAIL_FROM}> `);
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //Sendgrid
      return nodeMailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false, // Must be false for port 587
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1: Render the Pug Templete
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject,
      }
    );

    //2: Define Email Option
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html,
    };

    //3: Create an Transport and Send email
    await this.newTransport().sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the natours Family");
  }

  async sendpasswordReset() {
    await this.send(
      "passwordReset",
      "Your password Reset Token Vaild for 10 Min only!"
    );
  }
};

const sendEmail = catchAsync(async (options) => {
  //Define the mail Options
});
