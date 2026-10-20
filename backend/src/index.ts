import app from "./app";
import { enviarRecordatoriosDeManana } from "./services/correo.service";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Recordatorios automáticos (Visión y Alcance 5.1): cada hora se mandan los de los
// turnos de mañana que todavía no lo recibieron. Vive acá y no en app.ts para que
// los tests (que importan app) no lo disparen.
const UNA_HORA = 60 * 60 * 1000;
async function programarRecordatorios() {
  try {
    const { fecha, enviados } = await enviarRecordatoriosDeManana();
    if (enviados > 0) console.log(`[recordatorios] ${enviados} enviados para el ${fecha}`);
  } catch (e) {
    console.error("[recordatorios]", e);
  }
}
setTimeout(programarRecordatorios, 10_000);
setInterval(programarRecordatorios, UNA_HORA);
