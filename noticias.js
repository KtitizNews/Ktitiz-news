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
                imagen.alt = noticia.titulo || "Fortnite News";
                imagen.loading = "lazy";

                imagen.onerror = () => {
                    imagen.remove();
                };

                tarjeta.appendChild(imagen);
            }

            const contenido = document.createElement("div");
            contenido.className = "contenido-noticia";

            const titulo = document.createElement("h3");
            titulo.textContent = noticia.titulo || "Fortnite News";

            const texto = document.createElement("p");
            texto.textContent = noticia.texto || "";

            contenido.appendChild(titulo);
            contenido.appendChild(texto);

            tarjeta.appendChild(contenido);

            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error cargando las noticias:", error);

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
