import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"Doctor App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log("✅ Email Sent Successfully!");
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
    }
};

export default sendEmail;
