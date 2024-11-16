import nodemailer from "nodemailer";
import { ServerResponseType } from "../types/types";

export async function sendEmail(recipients: string | string[],subject: string,htmlBody: string): Promise<ServerResponseType> {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPW,
      },
    });

    let info = await transporter.sendMail({
      from: '"CuratorKit" <admin@curatorkit.com>', // sender address
      to: recipients, // list of receivers
      subject: subject, // Subject line
      html: `
      <div>
        <div style="width:600px;margin:auto;padding:0 30px;font-size:16px;line-height:120%;">
          ${htmlBody}
          <hr style="width:600px;border:1px solid #ebebeb">
          <div style="font-size:11px;text-align:center;color:gray;">
            <p style="margin:0;color:gray;">
              CuratorKit, 1241 Deer Park Avenue Suite 1 #1026, North Babylon, NY 11703
            </p>
            <a href="https://curatorkit.com" style="margin:0;color:gray;">https://curatorkit.com</a>
          </div>
        </div>
      </div>
      `
    });

    console.log("Message sent: %s", info.messageId);
    return {success: true, message: "Success"}
  }
  catch(res) {
    console.error(res)
    return {success: false, message: "Failed to send email"}
  }
}