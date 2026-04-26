// 1. Crear un array con al menos 8 números
const numeros = [12, 45, 7, 33, 89, 21, 54, 10];

// Variables para los cálculos
let sumaTotal = 0;
let mayor = numeros[0]; // Empezamos comparando con el primer elemento
let menor = numeros[0]; // [cite: 552]

// 2. Usar for...of para recorrer el array
for (const num of numeros) {
  sumaTotal += num; // Sumamos cada número

  // Buscamos el mayor
  if (num > mayor) {
    mayor = num;
  }

  // Buscamos el menor
  if (num < menor) {
    menor = num;
  }
}

// 3. Calcular el promedio
const promedio = sumaTotal / numeros.length;

// Mostrar resultados en consola
console.log("--- Resultados del Array ---");
console.log(`Array original: [${numeros}]`);
console.log(`Suma total: ${sumaTotal}`);
console.log(`Promedio: ${promedio}`);
console.log(`Número mayor: ${mayor}`);
console.log(`Número menor: ${menor}`);

// 4. Función generarAsteriscos(n)
function generarAsteriscos(n) {
  let resultado = "";
  for (let i = 0; i < n; i++) {
    resultado += "*"; // Concatenamos un asterisco en cada vuelta
  }
  return resultado;
}

// Prueba de la función
console.log("--- Prueba de Asteriscos ---");
console.log(`5 asteriscos: ${generarAsteriscos(5)}`);
console.log(`10 asteriscos: ${generarAsteriscos(10)}`);