const express = require("express");
const nodemailer = require("nodemailer");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Gmail Email API is running on Netlify",
    });
});

app.get("/email-check", async (req, res) => {
    try {
        await transporter.verify();

        res.json({
            success: true,
            message: "Gmail SMTP connection successful",
        });
    } catch (error) {
        console.error("SMTP error:", error.message);

        res.status(500).json({
            success: false,
            message: "Gmail SMTP connection failed",
        });
    }
});

app.post("/send-email", async (req, res) => {
    try {
        const { to, subject, message } = req.body || {};

        if (
            typeof to !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim()) ||
            !subject.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid recipient, subject and message are required",
            });
        }

        const info = await transporter.sendMail({
            from: `"Gmail Email API" <${process.env.GMAIL_USER}>`,
            to: to.trim(),
            subject: subject.trim(),
            text: message,
        });

        return res.status(200).json({
            success: true,
            message: "Email sent successfully",
            messageId: info.messageId,
        });
    } catch (error) {
        console.error("Email error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to send email",
        });
    }
});

// IMPORTANT: Export the Netlify function handler
module.exports = {
    handler: serverless(app),
};
