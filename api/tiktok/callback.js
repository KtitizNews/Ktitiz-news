export default async function handler(req, res) {
    try {
        const { code, error, error_description } = req.query;

        // El usuario canceló o TikTok devolvió un error
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
                    <a href="/tiktok-login/" style="color:#00e6d9;">
                        Volver a KtitiZ News
                    </a>
                </body>
                </html>
            `);
        }

        if (!code) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>No se recibió el código de TikTok</h1>
                    <p>La autorización no pudo completarse.</p>
                    <a href="/tiktok-login/" style="color:#00e6d9;">
                        Volver a KtitiZ News
                    </a>
                </body>
                </html>
            `);
        }

        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
        const redirectUri = process.env.TIKTOK_REDIRECT_URI;

        if (!clientKey || !clientSecret || !redirectUri) {
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Error - KtitiZ News</title>
                </head>
                <body style="background:#080b18;color:white;font-family:Arial;text-align:center;padding:60px;">
                    <h1>Error de configuración</h1>
                    <p>Faltan variables de configuración de TikTok en el servidor.</p>
                </body>
                </html>
            `);
        }

        // Intercambiar el código temporal por el Access Token
        const tokenResponse = await fetch(
            "https://open.tiktokapis.com/v2/oauth/token/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_key: clientKey,
                    client_secret: clientSecret,
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: redirectUri
                }).toString()
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error("TikTok OAuth error:", tokenData);

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
                    <a href="/tiktok-login/" style="color:#00e6d9;">
                        Volver a KtitiZ News
                    </a>
                </body>
                </html>
            `);
        }

        // No mostramos nunca el Access Token al usuario.
        console.log("TikTok OAuth autorizado correctamente.");

        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TikTok conectado - KtitiZ News</title>
            </head>
            <body style="margin:0;background:#080b18;color:white;font-family:Arial;text-align:center;">
                <div style="max-width:650px;margin:0 auto;padding:80px 25px;">
                    <h1 style="color:#00e6d9;">TikTok conectado</h1>
                    <p style="font-size:18px;">
                        La autorización de TikTok se ha completado correctamente.
                    </p>
                    <p style="opacity:.8;">
                        Ya puedes volver a KtitiZ News.
                    </p>
                    <a
                        href="/tiktok-login/"
                        style="display:inline-block;margin-top:25px;padding:14px 25px;border-radius:12px;background:linear-gradient(135deg,#7a00ff,#00e6d9);color:white;text-decoration:none;font-weight:bold;"
                    >
                        Volver a KtitiZ News
                    </a>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("TikTok callback error:", error);

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
                <a href="/tiktok-login/" style="color:#00e6d9;">
                    Volver a KtitiZ News
                </a>
            </body>
            </html>
        `);
    }
}
