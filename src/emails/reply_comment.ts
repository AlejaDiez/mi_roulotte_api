interface Props {
    username: string;
    post: string;
    originalComment: string;
    replySnippet: string;
    url: string;
    unsubscribeUrl: string;
}

export default ({ username, post, originalComment, replySnippet, url, unsubscribeUrl }: Props) => {
    return `<!doctype html>
<html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>New Reply to Your Comment - Mi Roulotte</title>
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
                                    New Reply to Your Comment
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
                                Someone has replied to your comment on
                                <strong style="font-weight: 600">“${post}”</strong>:
                            </td>
                        </tr>
                        <tr>
                            <td
                                align="left"
                                style="
                                    padding: 24px 0 8px 0;
                                    font-size: 16px;
                                    line-height: 24px;
                                    color: #525252;
                                ">
                                <div
                                    style="
                                        padding: 0.5rem 1rem;
                                        border-left: 1px solid #a8a8a8;
                                        background: #f4f4f4;
                                    ">
                                    <strong style="font-weight: 600">Your comment:</strong><br />
                                    <em>${originalComment}</em>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td
                                align="left"
                                style="
                                    padding: 0 0 40px 0;
                                    font-size: 16px;
                                    line-height: 24px;
                                    color: #525252;
                                ">
                                <div
                                    style="
                                        padding: 0.5rem 1rem;
                                        border-left: 1px solid #a8a8a8;
                                        background: #f4f4f4;
                                    ">
                                    <strong style="font-weight: 600">Your reply:</strong><br />
                                    <em>${replySnippet}</em>
                                </div>
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
                                    View Comment
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
                                You’re receiving this email because you subscribed to comment
                                notifications on Mi Roulotte. If you no longer wish to receive these
                                notifications, you can
                                <a
                                    href="${unsubscribeUrl}"
                                    style="color: currentColor; text-decoration: underline">
                                    unsubscribe here</a
                                >.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;
};
