interface Props {
    username: string;
    code: string;
}

export default ({ username, code }: Props) => {
    return `<!doctype html>
<html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Your 2FA Code - Mi Roulotte</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Serif:wght@600&display=swap"
            rel="stylesheet" />
    </head>
    <body
        style="
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: &quot;IBM Plex Sans&quot;, sans-serif;
        ">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
            <tr>
                <td align="center">
                    <table
                        width="600"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        bgcolor="#ffffff"
                        style="max-width: 600px; margin: 0 auto; padding: 20px">
                        <tr>
                            <td align="left">
                                <h1
                                    style="
                                        margin: 0;
                                        font-size: 36px;
                                        line-height: 40px;
                                        color: #161616;
                                        font-weight: 700;
                                    ">
                                    Two-Factor Authentication
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td
                                align="left"
                                style="
                                    padding-top: 40px;
                                    padding-bottom: 4px;
                                    font-size: 16px;
                                    line-height: 24px;
                                    color: #525252;
                                ">
                                Hello ${username},
                            </td>
                        </tr>
                        <tr>
                            <td
                                align="left"
                                style="
                                    padding: 4px 0;
                                    font-size: 16px;
                                    line-height: 24px;
                                    color: #525252;
                                ">
                                To complete your sign in to
                                <strong style="font-weight: 600">Mi Roulotte</strong>, please enter
                                the following verification code:
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 24px 0 40px 0">
                                <table
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    align="center"
                                    style="border-collapse: collapse">
                                    <tr>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[0]}
                                        </td>
                                        <td width="12"></td>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[1]}
                                        </td>
                                        <td width="12"></td>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[2]}
                                        </td>
                                        <td width="12"></td>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[3]}
                                        </td>
                                        <td width="12"></td>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[4]}
                                        </td>
                                        <td width="12"></td>
                                        <td
                                            style="
                                                width: 48px;
                                                height: 56px;
                                                background-color: #f4f4f4;
                                                text-align: center;
                                                font-family: &quot;IBM Plex Serif&quot;, serif;
                                                font-size: 20px;
                                                line-height: 28px;
                                                font-weight: 600;
                                                color: #161616;
                                            ">
                                            ${code[5]}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td
                                align="left"
                                style="
                                    padding-top: 4px;
                                    font-size: 12px;
                                    line-height: 16px;
                                    font-weight: 400;
                                    letter-spacing: 1.6px;
                                    color: #a8a8a8;
                                ">
                                This code will expire in 7 minutes. If you didn’t request this
                                code, you can safely ignore this email.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
};
