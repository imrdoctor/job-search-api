export const EmailotpTmeplate = function (otp, title, descreption) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            max-width: 350px;
            margin: auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-top: 5px solid #5A189A;
        }
.otp {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 5px;
    margin: 15px auto; 
    background: #5A189A;
    color: #fff;
    padding: 12px;
    display: block;
    border-radius: 6px;
    width: fit-content; 
}

        .message {
            font-size: 16px;
            color: #333;
            margin-bottom: 12px;
        }
        .footer {
            font-size: 13px;
            color: #555;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="color: #5A189A;">${title}</h2>
        <p class="message">Hello,</p>
        <p class="message">${descreption}</p>
        <div class="otp">${otp}</div>
        <p class="message">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p class="footer">If you did not request this, please ignore this email.</p>
    </div>
</body>
</html>`
}

export const EmailUrlAuth = function (link) {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        }

        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            max-width: 350px;
            margin: auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-top: 5px solid #5A189A;
        }

        .btn {
            display: block;
            text-align: center;
            color: #fff !important;
            text-decoration: none !important;
            background: #5A189A;
            font-size: 18px;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 15px auto;
            width: fit-content;
        }

        .message {
            font-size: 16px;
            color: #333;
            margin-bottom: 12px;
        }

        .footer {
            font-size: 13px;
            color: #555;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2 style="color: #5A189A;">Verify Your Email</h2>
        <p class="message">Hello,</p>
        <p class="message">To activate your account, please click the button below:</p>
        <a href="${link}" target="_blank" class="btn">Activate Account</a>
        <p class="message">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p class="message" style="word-break: break-word; color: #5A189A;">${link}</p>
        <p class="footer">If you did not request this, please ignore this email.</p>
    </div>
</body>

</html>
`
}
export const applicationAccepted = function (firstName, logo, jobTitle) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f8f9fa;">

    <table align="center" width="100%" style="max-width: 350px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-top: 5px solid #28a745;">
        <tr>
            <td align="left">
                <img src="${logo}" alt="Company Logo" style="width: 50px; height: 50px; border-radius: 50%; display: block;">
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #28a745;">Accepted ✅</h2>
                <p style="font-size: 16px; color: #333;">Hello ${firstName},</p>
                <p style="font-size: 16px; color: #333;">Congratulations! Your application for the position of <strong>${jobTitle}</strong> has been <strong>approved</strong>.</p>
                <p style="font-size: 16px; color: #333;">We will contact you soon with further details.</p>
                <p style="font-size: 13px; color: #555;">If you have any questions, feel free to reach out.</p>
            </td>
        </tr>
    </table>

</body>
</html>
    `;
};


export const applicationRejected = function (firstName, logo, jobTitle) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f8f9fa;">

    <table align="center" width="100%" style="max-width: 350px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-top: 5px solid #dc3545;">
        <tr>
            <td align="left">
                <img src="${logo}" alt="Company Logo" style="width: 50px; height: 50px; border-radius: 50%; display: block;">
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #dc3545;">Rejected ❌</h2>
                <p style="font-size: 16px; color: #333;">Hello ${firstName},</p>
                <p style="font-size: 16px; color: #333;">We regret to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>rejected</strong>.</p>
                <p style="font-size: 16px; color: #333;">We appreciate your interest and encourage you to apply again in the future.</p>
                <p style="font-size: 13px; color: #555;">If you have any questions, feel free to reach out.</p>
            </td>
        </tr>
    </table>

</body>
</html>
    `;
};
