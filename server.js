const express=require('express');
const nodemailer=require('nodemailer');
const cors=require('cors');
require("dotenv").config()

const app=express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send('Hello');
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Check Gmail SMTP connection
app.get("/api/email-check", async (req, res) => {
    try {
        await transporter.verify();
        res.status(200).json({
            success: true,
            message: "Gmail SMTP connection successful",
        });
    } catch (error) {
        console.error("SMTP verification failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Gmail SMTP connection failed",
        });
    }
});

// Send email API
app.post("/api/send-email", async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        // Validate required fields
        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Recipient, subject and message are required",
            });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof to !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string" ||
            !emailRegex.test(to) ||
            !subject.trim() ||
            !message.trim() ||
            subject.length > 200 ||
            message.length > 10000
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid email details",
            });
        }

        const mailOptions = {
            from: `"My Node API" <${process.env.GMAIL_USER}>`,
            to: to.trim(),
            subject: subject.trim(),
            text: message,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.messageId);

        return res.status(200).json({
            success: true,
            message: "Email sent successfully",
            messageId: info.messageId,
        });
    } catch (error) {
        console.error("Email sending failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to send email. Check server configuration.",
        });
    }
});


const PORT=process.env.PORT;
app.listen(PORT, ()=>console.log(`Server running port is ${PORT}`));