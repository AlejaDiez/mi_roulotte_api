interface Props {
    username: string;
    url: string;
}

export default ({ username, url }: Props) => {
    return `<!doctype html>
<html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome to Mi Roulotte</title>
        <link rel="preload" as="image" href="https://miroulotte.es/favicon.svg" />
        <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
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
                                    Welcome to Mi Roulotte
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
                                Thank you for signing up for
                                <strong style="font-weight: 600">Mi Roulotte</strong>. To activate
                                your account and get started, please click the button below:
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 24px; padding-bottom: 40px">
                                <a
                                    href="${url}"
                                    style="
                                        display: inline-block;
                                        padding: 20px 24px;
                                        background: #161616;
                                        font-size: 16px;
                                        line-height: 16px;
                                        color: #ffffff;
                                        text-decoration: none;
                                    ">
                                    Verify account
                                </a>
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
                                If you didn't create this account, you can safely ignore this email.
                                The registration will not be completed unless the activation link is
                                used.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
};
