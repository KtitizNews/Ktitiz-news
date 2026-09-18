document.addEventListener("DOMContentLoaded", cargarNoticias);

async function cargarNoticias() {
    const contenedor = document.getElementById("noticias");

    if (!contenedor) {
        console.error("No se encontró el elemento #noticias");
        return;
    }

    try {
        const respuesta = await fetch("noticias.json", {
            cache: "no-store"
        });

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar noticias.json (${respuesta.status})`
            );
        }

        const noticias = await respuesta.json();

        if (!Array.isArray(noticias) || noticias.length === 0) {
            mostrarVacio(contenedor);
            return;
        }

        contenedor.innerHTML = "";

        noticias.forEach((noticia) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-noticia";

            if (noticia.imagen) {
                const imagen = document.createElement("img");

                imagen.className = "imagen-noticia";
                imagen.src = noticia.imagen;

                imagen.alt =
                    noticia.titulo_es ||
                    noticia.titulo_en ||
                    "Fortnite News";

                imagen.loading = "lazy";

                imagen.onerror = () => {
                    imagen.remove();
                };

                tarjeta.appendChild(imagen);
            }

            const contenido = document.createElement("div");
            contenido.className = "contenido-noticia";

            // =================================================
            // ESPAÑOL
            // =================================================

            const tituloES = document.createElement("h3");
            tituloES.textContent =
                "🇪🇸 " +
                (noticia.titulo_es || noticia.titulo_en || "Fortnite News");

            const textoES = document.createElement("p");
            textoES.textContent =
                noticia.texto_es || noticia.texto_en || "";

            // =================================================
            // FRANCÉS
            // =================================================

            const tituloFR = document.createElement("h3");
            tituloFR.textContent =
                "🇫🇷 " +
                (noticia.titulo_fr || noticia.titulo_en || "Fortnite News");

            const textoFR = document.createElement("p");
            textoFR.textContent =
                noticia.texto_fr || noticia.texto_en || "";

            // =================================================
            // INGLÉS
            // =================================================

            const tituloEN = document.createElement("h3");
            tituloEN.textContent =
                "🇬🇧 " +
                (noticia.titulo_en || "Fortnite News");

            const textoEN = document.createElement("p");
            textoEN.textContent =
                noticia.texto_en || "";

            // =================================================
            // SEPARADORES
            // =================================================

            const separador1 = document.createElement("hr");
            const separador2 = document.createElement("hr");

            contenido.appendChild(tituloES);
            contenido.appendChild(textoES);

            contenido.appendChild(separador1);

            contenido.appendChild(tituloFR);
            contenido.appendChild(textoFR);

            contenido.appendChild(separador2);

            contenido.appendChild(tituloEN);
            contenido.appendChild(textoEN);

            tarjeta.appendChild(contenido);

            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(
            "Error cargando las noticias:",
            error
        );

        contenedor.innerHTML = `
            <div class="noticias-vacias">
                <p>Las últimas noticias de Fortnite no están disponibles ahora mismo.</p>
                <p>Les dernières actualités Fortnite ne sont pas disponibles pour le moment.</p>
                <p>The latest Fortnite news is not available right now.</p>
            </div>
        `;
    }
}


function mostrarVacio(contenedor) {
    contenedor.innerHTML = `
        <div class="noticias-vacias">
            <p>Las últimas noticias de Fortnite aparecerán aquí automáticamente.</p>
            <p>Les dernières actualités Fortnite apparaîtront ici automatiquement.</p>
            <p>The latest Fortnite news will appear here automatically.</p>
        </div>
    `;
}
