import crypto from "crypto";

export default async function handler(req, res) {

    const allowedOrigin =
        "https://ktitiznews.github.io";

    res.setHeader(
        "Access-Control-Allow-Origin",
        allowedOrigin
    );

    res.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    try {

        if (req.method !== "POST") {
            return res.status(405).json({
                error: "Method not allowed"
            });
        }

        const cookies =
            req.headers.cookie || "";

        const sessionMatch =
            cookies.match(
                /(?:^|;\s*)tiktok_session=([^;]+)/
            );

        if (!sessionMatch) {
            return res.status(401).json({
                error:
                    "TikTok no está conectado"
            });
        }

        const sessionValue =
            decodeURIComponent(
                sessionMatch[1]
            );

        const parts =
            sessionValue.split(".");

        if (parts.length !== 3) {
            return res.status(401).json({
                error:
                    "Sesión TikTok inválida"
            });
        }

        const clientSecret =
            process.env.TIKTOK_CLIENT_SECRET;

        if (!clientSecret) {
            return res.status(500).json({
                error:
                    "Falta TIKTOK_CLIENT_SECRET"
            });
        }

        const iv =
            Buffer.from(
                parts[0],
                "base64"
            );

        const authTag =
            Buffer.from(
                parts[1],
                "base64"
            );

        const encrypted =
            Buffer.from(
                parts[2],
                "base64"
            );

        const key =
            crypto
                .createHash("sha256")
                .update(clientSecret)
                .digest();

        const decipher =
            crypto.createDecipheriv(
                "aes-256-gcm",
                key,
                iv
            );

        decipher.setAuthTag(
            authTag
        );

        const accessToken =
            Buffer.concat([
                decipher.update(
                    encrypted
                ),
                decipher.final()
            ]).toString("utf8");

        const {
            video_size,
            mime_type
        } = req.body || {};

        const videoSize =
            Number(video_size);

        if (
            !Number.isSafeInteger(
                videoSize
            ) ||
            videoSize <= 0
        ) {
            return res.status(400).json({
                error:
                    "Tamaño de vídeo inválido"
            });
        }

        const allowedTypes = [
            "video/mp4",
            "video/webm",
            "video/quicktime"
        ];

        const mimeType =
            allowedTypes.includes(
                mime_type
            )
                ? mime_type
                : "video/mp4";

        const MB =
            1024 * 1024;

        let chunkSize;

        if (
            videoSize <
            5 * MB
        ) {
            chunkSize =
                videoSize;
        } else if (
            videoSize <=
            64 * MB
        ) {
            chunkSize =
                videoSize;
        } else {
            chunkSize =
                64 * MB;
        }

        const totalChunkCount =
            Math.ceil(
                videoSize /
                chunkSize
            );

        const response =
            await fetch(
                "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json; charset=UTF-8"
                    },

                    body:
                        JSON.stringify({
                            source_info: {
                                source:
                                    "FILE_UPLOAD",

                                video_size:
                                    videoSize,

                                chunk_size:
                                    chunkSize,

                                total_chunk_count:
                                    totalChunkCount
                            }
                        })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.error?.code !== "ok"
        ) {

            console.error(
                "TikTok upload init error:",
                data
            );

            return res.status(400).json({
                error:
                    "TikTok no pudo iniciar la subida",

                details:
                    data.error || data
            });
        }

        return res.status(200).json({

            success:
                true,

            upload_url:
                data.data.upload_url,

            publish_id:
                data.data.publish_id,

            video_size:
                videoSize,

            chunk_size:
                chunkSize,

            total_chunk_count:
                totalChunkCount,

            mime_type:
                mimeType
        });

    } catch (error) {

        console.error(
            "TikTok upload-init error:",
            error
        );

        return res.status(500).json({
            error:
                "Error interno al iniciar la subida"
        });
    }
}
