export default function handler(req, res) {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !redirectUri) {
        return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Error - KtitiZ News</title>
            </head>
            <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                <h1>Error de configuración</h1>
                <p>No están configuradas las variables de TikTok en el servidor.</p>
            </body>
            </html>
        `);
    }

    const state = crypto.randomUUID();

    const params = new URLSearchParams({
        client_key: clientKey,
        response_type: "code",
        scope: "user.info.basic,video.upload",
        redirect_uri: redirectUri,
        state: state
    });

    const loginUrl =
        "https://www.tiktok.com/v2/auth/authorize/?" +
        params.toString();

    return res.redirect(302, loginUrl);
}
