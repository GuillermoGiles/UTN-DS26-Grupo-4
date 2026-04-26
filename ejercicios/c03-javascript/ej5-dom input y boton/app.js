// 1. Selección de elementos del DOM
const inputAltura = document.querySelector('#altura');
const boton = document.querySelector('#btnGenerar');
const display = document.querySelector('#resultado');

// 2. Escuchar el evento click
boton.addEventListener('click', () => {
    const altura = parseInt(inputAltura.value); // Convertimos el texto a número
    display.innerHTML = ""; // Limpiamos el contenido previo
    display.classList.remove('error'); // Quitamos clase de error si existía

    // 3. Validación 
    if (isNaN(altura) || altura < 1) {
        display.innerHTML = "Error: Por favor, ingresá un número mayor o igual a 1.";
        display.classList.add('error');
        return; // Cortamos la ejecución aquí
    }

    // 4. Generación del medio-árbol
    let arbol = "";
    for (let i = 1; i <= altura; i++) {
        // En cada fila (i), agregamos i asteriscos y un salto de línea
        for (let j = 0; j < i; j++) {
            arbol += "*";
        }
        arbol += "\n"; 
    }

    // 5. Mostrar el resultado en la página
    display.innerText = arbol;
});