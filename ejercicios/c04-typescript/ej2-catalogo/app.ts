export {}; // Para evitar errores de variables duplicadas con el JS

// 1. Definición de la Interface
interface Libro {
    isbn: string;
    titulo: string;
    autor: string;
    precio: number;
    disponible: boolean;
    genero?: string; // Opcional
}

// 2. Datos de prueba
const catalogo: Libro[] = [
    { isbn: "111", titulo: "El Aleph", autor: "Borges", precio: 1500, disponible: true, genero: "Fantasía" },
    { isbn: "222", titulo: "Rayuela", autor: "Cortázar", precio: 1200, disponible: false },
    { isbn: "333", titulo: "Ficciones", autor: "Borges", precio: 1800, disponible: true },
    { isbn: "444", titulo: "El Túnel", autor: "Sabato", precio: 1100, disponible: true, genero: "Psicológico" },
    { isbn: "555", titulo: "Sobre héroes y tumbas", autor: "Sabato", precio: 2200, disponible: false }
];

// 3. Selección de elementos del DOM
const inputAutor = document.querySelector("#filtroAutor") as HTMLInputElement;
const btnFiltrar = document.querySelector("#filtrar") as HTMLButtonElement;
const btnDisponibles = document.querySelector("#mostrarDisponibles") as HTMLButtonElement;
const btnTodos = document.querySelector("#mostrarTodos") as HTMLButtonElement;
const ulListado = document.querySelector("#listado") as HTMLUListElement;
const pStats = document.querySelector("#stats") as HTMLParagraphElement;

// 4. Funciones de Lógica
function buscarPorAutor(autor: string): Libro[] {
    return catalogo.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));
}

function librosDisponibles(): Libro[] {
    return catalogo.filter(l => l.disponible);
}

function precioPromedio(libros: Libro[]): number {
    if (libros.length === 0) return 0;
    const total = libros.reduce((acc, l) => acc + l.precio, 0);
    return total / libros.length;
}

// 5. Función de Renderizado
function renderizar(libros: Libro[]): void {
    // Limpiamos la lista
    ulListado.innerHTML = "";

    // Agregamos cada libro
    libros.forEach(libro => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${libro.titulo}</strong> - ${libro.autor} (ISBN: ${libro.isbn})</span>
            <span class="${libro.disponible ? 'disponible' : 'no-disponible'}">
                $${libro.precio} ${libro.disponible ? '[✓]' : '[X]'}
            </span>
        `;
        ulListado.appendChild(li);
    });

    // Actualizamos estadísticas
    const promedio = precioPromedio(libros);
    pStats.innerText = `Cantidad: ${libros.length} | Precio Promedio: $${promedio.toFixed(2)}`;
}

// 6. Eventos
btnFiltrar.addEventListener("click", () => {
    const autorBusqueda = inputAutor.value;
    renderizar(buscarPorAutor(autorBusqueda));
});

btnDisponibles.addEventListener("click", () => {
    renderizar(librosDisponibles());
});

btnTodos.addEventListener("click", () => {
    renderizar(catalogo);
});

// Carga inicial
window.onload = () => {
    renderizar(catalogo);
};