import nodemailer from "nodemailer";

import { UserDocument } from "../models/user.model";

class Email {
  name: string;
  email: string;
  emailFrom: string;
  message: string;
  constructor(user: UserDocument, message: string) {
    this.name = user.name;
    this.email = user.email;
    this.emailFrom = "nyagucha.kevin.otwori@gmail.com";
    this.message = message;
  }

  transporter() {
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "8d212e47fd9db5",
        pass: "75985baad4a3be",
      },
    });
  }
  async sendEmail(subject: string) {
    const mailOptions = {
      from: this.emailFrom,
      to: this.email,
      subject: subject,
      text: this.message,
      html: `<div><h2>${subject}</h2>
         <h1 >Hello ${this.name}</h1>
         <p>${this.message}</p>
      </div>`,
    };
    await this.transporter().sendMail(mailOptions);
  }

  async sendConfirmEmail() {
    await this.sendEmail(
      "Thank you for creating an account with us. Please confirm your email"
    );
  }

  async sendResetPassword() {
    await this.sendEmail("Forgot password reset link");
  }
}

export default Email;
