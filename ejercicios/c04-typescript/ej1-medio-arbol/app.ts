export {}; // Evita conflictos con otros archivos

// 1. Declaramos las variables UNA SOLA VEZ al principio [cite: 286]
const input = document.querySelector("#inputAltura") as HTMLInputElement;
const boton = document.querySelector("#btnGenerar") as HTMLButtonElement;
const pre = document.querySelector("#resultado") as HTMLPreElement;

// 2. Función tipada: recibe un número y devuelve un string [cite: 145, 291]
function generarAsteriscos(n: number): string {
  let resultado: string = "";
  for (let i = 1; i <= n; i++) {
    resultado += "*".repeat(i) + "\n";
  }
  return resultado;
}

// 3. Configuramos el evento del botón [cite: 283]
boton.addEventListener("click", () => {
  const altura: number = parseInt(input.value);

  if (isNaN(altura) || altura < 1) {
    pre.innerText = "Error: Ingresá un número válido.";
  } else {
    pre.innerText = generarAsteriscos(altura);
  }
});