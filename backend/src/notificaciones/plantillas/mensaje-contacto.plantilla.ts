export function plantillaMensajeContacto(datos: {
  nombreEmpresa: string;
  nombreVisitante: string;
  emailVisitante: string;
  telefonoVisitante?: string;
  mensaje: string;
}): string {
  const { nombreEmpresa, nombreVisitante, emailVisitante, telefonoVisitante, mensaje } = datos;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 24px 0; font-family: Arial, Helvetica, sans-serif;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; overflow: hidden;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #2563eb; padding: 20px 24px;">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${nombreEmpresa}</p>
                <p style="margin: 4px 0 0; color: #dbeafe; font-size: 13px;">Nuevo mensaje de contacto</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #111827;">
                  <strong>Nombre:</strong> ${nombreVisitante}
                </p>
                <p style="margin: 0 0 12px; font-size: 14px; color: #111827;">
                  <strong>Email:</strong> ${emailVisitante}
                </p>
                <p style="margin: 0 0 12px; font-size: 14px; color: #111827;">
                  <strong>Teléfono:</strong> ${telefonoVisitante ?? 'No proporcionado'}
                </p>
                <p style="margin: 16px 0 4px; font-size: 14px; color: #111827;"><strong>Mensaje:</strong></p>
                <p style="margin: 0; font-size: 14px; color: #374151; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  ${mensaje}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Este mensaje fue enviado desde el formulario de contacto de ${nombreEmpresa}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}