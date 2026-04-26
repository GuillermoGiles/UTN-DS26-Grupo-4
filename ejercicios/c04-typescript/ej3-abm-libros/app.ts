export {}; // Módulo independiente

interface Libro {
  isbn: string;
  titulo: string;
  autor: string;
  precio: number;
  disponible: boolean;
  genero?: string;
}

// Empezamos con libros precargados
let catalogo: Libro[] = [
  { isbn: "AUTO-1", titulo: "El Aleph", autor: "Borges", precio: 1500, disponible: true },
  { isbn: "AUTO-2", titulo: "Rayuela", autor: "Cortázar", precio: 1200, disponible: false }
];

// Selección de elementos
const ulListado = document.querySelector("#listado") as HTMLUListElement;
const divError = document.querySelector("#errorForm") as HTMLDivElement;
const pStats = document.querySelector("#stats") as HTMLParagraphElement;

// Inputs del formulario
const inputTitulo = document.querySelector("#titulo") as HTMLInputElement;
const inputAutor = document.querySelector("#autor") as HTMLInputElement;
const inputPrecio = document.querySelector("#precio") as HTMLInputElement;
const checkDisponible = document.querySelector("#disponible") as HTMLInputElement;
const btnAgregar = document.querySelector("#btnAgregar") as HTMLButtonElement;

// --- FUNCIONES ---

function renderizar(): void {
  ulListado.innerHTML = "";
  
  catalogo.forEach(libro => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${libro.titulo}</strong> - ${libro.autor} ($${libro.precio})</span>
      <button class="btn-eliminar" onclick="window.eliminarLibro('${libro.isbn}')">Eliminar</button>
    `;
    ulListado.appendChild(li);
  });

  const total = catalogo.reduce((acc, l) => acc + l.precio, 0);
  const promedio = catalogo.length > 0 ? total / catalogo.length : 0;
  pStats.innerText = `Libros: ${catalogo.length} | Promedio: $${promedio.toFixed(2)}`;
}

// Validación y creación de objeto
function validarFormulario(): Libro | null {
  const titulo = inputTitulo.value.trim();
  const autor = inputAutor.value.trim();
  const precio = parseFloat(inputPrecio.value);
  const disponible = checkDisponible.checked;

  if (titulo === "" || autor === "" || isNaN(precio) || precio <= 0) {
    return null;
  }

  return {
    isbn: "AUTO-" + Date.now(), // Generamos ISBN random
    titulo,
    autor,
    precio,
    disponible
  };
}

function agregarLibro(libro: Libro): void {
  catalogo.push(libro);
  renderizar();
}

// Exponemos eliminarLibro al objeto window para que el 'onclick' del HTML lo encuentre
(window as any).eliminarLibro = (isbn: string): void => {
  catalogo = catalogo.filter(l => l.isbn !== isbn);
  renderizar();
};

// --- HANDLER ---

btnAgregar.addEventListener("click", () => {
  const nuevoLibro = validarFormulario();

  if (nuevoLibro === null) {
    divError.innerText = "Error: Todos los campos son obligatorios y el precio debe ser mayor a 0.";
    divError.style.display = "block";
  } else {
    divError.style.display = "none";
    agregarLibro(nuevoLibro);
    
    // Limpiar formulario
    inputTitulo.value = "";
    inputAutor.value = "";
    inputPrecio.value = "";
  }
});

// Carga inicial
renderizar();