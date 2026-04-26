// --- PARTE 1: Clasificar Nota con if/else ---
// Usamos una función tradicional para clasificar el rendimiento académico
function clasificarNota(nota) {
    if (nota < 4) {
        return "Desaprobado";
    } else if (nota >= 4 && nota <= 7) {
        return "Aprobado";
    } else if (nota >= 8) {
        return "Promocionado";
    }
}

// --- PARTE 2: Día de la Semana con switch ---
// El switch es ideal cuando comparamos una sola variable contra muchos valores posibles
function diaDeLaSemana(numero) {
    switch (numero) {
        case 1: return "Lunes";
        case 2: return "Martes";
        case 3: return "Miércoles";
        case 4: return "Jueves";
        case 5: return "Viernes";
        case 6: return "Sábado (fin de semana)";
        case 7: return "Domingo (fin de semana)";
        default: return "Día inválido";
    }
}

// --- PARTE 3: Pruebas en consola ---
// Probamos las notas 
console.log("--- Test de Notas ---");
console.log(`Nota 2: ${clasificarNota(2)}`);
console.log(`Nota 6: ${clasificarNota(6)}`);
console.log(`Nota 10: ${clasificarNota(10)}`);

// Probamos los días
console.log("--- Test de Días ---");
console.log(`Día 1: ${diaDeLaSemana(1)}`);
console.log(`Día 6: ${diaDeLaSemana(6)}`);
console.log(`Día 9: ${diaDeLaSemana(9)}`);