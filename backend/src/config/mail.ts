import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envío de e-mails por SMTP (por ejemplo Gmail con una contraseña de aplicación:
 * SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=tu@gmail.com, SMTP_PASS=<app password>).
 * Si falta alguna variable no se envía nada: el correo queda registrado como SIMULADO,
 * así la funcionalidad se puede mostrar sin cuenta de correo.
 */
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

export const correoConfigurado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter: Transporter | null = null;

export function obtenerTransporter(): Transporter | null {
  if (!correoConfigurado) return null;
  if (!transporter) {
    const puerto = Number(SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: puerto,
      secure: puerto === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export const remitente = MAIL_FROM ?? `Lubricentro San José <${SMTP_USER ?? "no-reply@sanjose.test"}>`;
