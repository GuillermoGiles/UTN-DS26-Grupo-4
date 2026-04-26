// 2. Datos de prueba
const catalogo = [
    { isbn: "111", titulo: "El Aleph", autor: "Borges", precio: 1500, disponible: true, genero: "Fantasía" },
    { isbn: "222", titulo: "Rayuela", autor: "Cortázar", precio: 1200, disponible: false },
    { isbn: "333", titulo: "Ficciones", autor: "Borges", precio: 1800, disponible: true },
    { isbn: "444", titulo: "El Túnel", autor: "Sabato", precio: 1100, disponible: true, genero: "Psicológico" },
    { isbn: "555", titulo: "Sobre héroes y tumbas", autor: "Sabato", precio: 2200, disponible: false }
];
// 3. Selección de elementos del DOM
const inputAutor = document.querySelector("#filtroAutor");
const btnFiltrar = document.querySelector("#filtrar");
const btnDisponibles = document.querySelector("#mostrarDisponibles");
const btnTodos = document.querySelector("#mostrarTodos");
const ulListado = document.querySelector("#listado");
const pStats = document.querySelector("#stats");
// 4. Funciones de Lógica
function buscarPorAutor(autor) {
    return catalogo.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));
}
function librosDisponibles() {
    return catalogo.filter(l => l.disponible);
}
function precioPromedio(libros) {
    if (libros.length === 0)
        return 0;
    const total = libros.reduce((acc, l) => acc + l.precio, 0);
    return total / libros.length;
}
// 5. Función de Renderizado
function renderizar(libros) {
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
export {};
