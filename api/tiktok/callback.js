import crypto from "crypto";

export default async function handler(req, res) {
    try {
        const {
            code,
            state,
            error,
            error_description
        } = req.query;

        if (error) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>TikTok - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>Conexión cancelada</h1>
                    <p>${error_description || error}</p>
                    <a href="https://ktitiznews.github.io/Ktitiz-news/tiktok-login/" style="color:#00e6d9;">
                        Volver a KtitiZ News
                    </a>
                </body>
                </html>
            `);
        }

        if (!code || !state) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>Autorización incompleta</h1>
                    <p>No se recibió correctamente la autorización de TikTok.</p>
                </body>
                </html>
            `);
        }

        const cookies = req.headers.cookie || "";

        const stateMatch = cookies.match(
            /(?:^|;\s*)tiktok_oauth_state=([^;]+)/
        );

        if (
            !stateMatch ||
            stateMatch[1] !== state
        ) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error TikTok - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>Sesión de autorización no válida</h1>
                    <p>La autorización de TikTok no pudo verificarse.</p>
                </body>
                </html>
            `);
        }

        const clientKey =
            process.env.TIKTOK_CLIENT_KEY;

        const clientSecret =
            process.env.TIKTOK_CLIENT_SECRET;

        const redirectUri =
            process.env.TIKTOK_REDIRECT_URI;

        if (
            !clientKey ||
            !clientSecret ||
            !redirectUri
        ) {
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>Error de configuración</h1>
                    <p>Faltan variables de TikTok en el servidor.</p>
                </body>
                </html>
            `);
        }

        const tokenResponse = await fetch(
            "https://open.tiktokapis.com/v2/oauth/token/",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body:
                    new URLSearchParams({
                        client_key:
                            clientKey,

                        client_secret:
                            clientSecret,

                        code:
                            code,

                        grant_type:
                            "authorization_code",

                        redirect_uri:
                            redirectUri
                    }).toString()
            }
        );

        const tokenData =
            await tokenResponse.json();

        if (
            !tokenResponse.ok ||
            tokenData.error
        ) {
            console.error(
                "TikTok OAuth error:",
                tokenData
            );

            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error TikTok - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>No se pudo conectar TikTok</h1>
                    <p>TikTok no pudo completar la autorización.</p>
                </body>
                </html>
            `);
        }

        const accessToken =
            tokenData.access_token;

        if (!accessToken) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error TikTok - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>No se recibió el Access Token</h1>
                    <p>TikTok no devolvió un token válido.</p>
                </body>
                </html>
            `);
        }

        /*
         * Cifrar el Access Token
         */

        const key =
            crypto
                .createHash("sha256")
                .update(clientSecret)
                .digest();

        const iv =
            crypto.randomBytes(12);

        const cipher =
            crypto.createCipheriv(
                "aes-256-gcm",
                key,
                iv
            );

        let encrypted =
            cipher.update(
                accessToken,
                "utf8",
                "base64"
            );

        encrypted +=
            cipher.final("base64");

        const authTag =
            cipher
                .getAuthTag()
                .toString("base64");

        const sessionValue = [
            iv.toString("base64"),
            authTag,
            encrypted
        ].join(".");

        /*
         * Guardar sesión segura
         */

        res.setHeader(
            "Set-Cookie",
            [
                `tiktok_session=${encodeURIComponent(sessionValue)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=86400`,
                "tiktok_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
            ]
        );

        console.log(
            "TikTok OAuth autorizado correctamente."
        );

        /*
         * VOLVER A GITHUB PAGES
         *
         * Esta es la corrección importante.
         */

        return res.redirect(
            302,
            "https://ktitiznews.github.io/Ktitiz-news/tiktok-login/?connected=1"
        );

    } catch (error) {

        console.error(
            "TikTok callback error:",
            error
        );

        return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Error - KtitiZ News</title>
            </head>
            <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                <h1>Error interno</h1>
                <p>No se pudo completar la conexión con TikTok.</p>
                <a href="https://ktitiznews.github.io/Ktitiz-news/tiktok-login/" style="color:#00e6d9;">
                    Volver a KtitiZ News
                </a>
            </body>
            </html>
        `);
    }
}
