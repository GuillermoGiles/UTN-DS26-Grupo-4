/**
 * Calcula el precio final aplicando descuentos según el monto y medio de pago.
 * @param {number} monto - El valor original de la compra.
 * @param {string} medioPago - "E" (Efectivo), "D" (Débito), "C" (Crédito).
 */
function calcularPrecioFinal(monto, medioPago) {
    let montoFinal = monto;

    if (monto < 200) {
        // Monto menor a $200: sin descuento 
        montoFinal = monto;
    } 
    else if (monto >= 200 && monto <= 400) {
        // Entre $200 y $400: descuentos variables 
        if (medioPago === "E") {
            montoFinal = monto * 0.7; // 30% OFF
        } else if (medioPago === "D") {
            montoFinal = monto * 0.8; // 20% OFF
        } else if (medioPago === "C") {
            montoFinal = monto * 0.9; // 10% OFF
        }
    } 
    else {
        // Mayor a $400: 40% OFF para todos 
        montoFinal = monto * 0.6;
    }

    return montoFinal; // Retornar el monto final 
}

// --- PRUEBAS CON TEMPLATE LITERALS  ---
// Formato requerido: "Monto: $X | Pago: Y | Final: $Z"

console.log(`Monto: $150 | Pago: E | Final: $${calcularPrecioFinal(150, "E")}`);   // Sin descuento
console.log(`Monto: $300 | Pago: E | Final: $${calcularPrecioFinal(300, "E")}`);   // 30% OFF
console.log(`Monto: $300 | Pago: D | Final: $${calcularPrecioFinal(300, "D")}`);   // 20% OFF
console.log(`Monto: $300 | Pago: C | Final: $${calcularPrecioFinal(300, "C")}`);   // 10% OFF
console.log(`Monto: $500 | Pago: D | Final: $${calcularPrecioFinal(500, "D")}`);   // 40% OFF