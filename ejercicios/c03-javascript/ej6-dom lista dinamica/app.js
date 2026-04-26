// 1. Selectores de los elementos
const input = document.querySelector('#producto');
const btnAgregar = document.querySelector('#btnAgregar');
const lista = document.querySelector('#lista');
const contadorTxt = document.querySelector('#infoContador');
const errorMsg = document.querySelector('#errorMsg');

// 2. Función para actualizar el contador 
function actualizarContador() {
    const cantidad = lista.querySelectorAll('li').length;
    contadorTxt.innerText = `${cantidad} productos en la lista`;
}

// 3. Evento para agregar producto
btnAgregar.addEventListener('click', () => {
    const nombre = input.value.trim(); // .trim() quita espacios vacíos al inicio y final

    // Validación: que no esté vacío 
    if (nombre === "") {
        errorMsg.style.display = "block";
        return;
    }
    errorMsg.style.display = "none";

    // Crear el elemento de la lista (li)
    const nuevoItem = document.createElement('li');
    nuevoItem.innerHTML = `
        <span>${nombre}</span>
        <button class="eliminar">Eliminar</button>
    `;

    // 4. Lógica para el botón eliminar del item
    const btnEliminar = nuevoItem.querySelector('.eliminar');
    btnEliminar.addEventListener('click', () => {
        nuevoItem.remove(); // Borra el item de la lista
        actualizarContador(); // Recalcula el total
    });

    // 5. Agregar el li al ul de la página
    lista.appendChild(nuevoItem);
    
    // Limpiar input y actualizar contador
    input.value = "";
    input.focus();
    actualizarContador();
});