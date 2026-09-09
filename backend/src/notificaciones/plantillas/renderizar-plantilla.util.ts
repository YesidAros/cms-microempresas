export function renderizarPlantillaPersonalizada(
  plantillaHtml: string,
  datos: Record<string, string>,
): string {
  let resultado = plantillaHtml;

  for (const [clave, valor] of Object.entries(datos)) {
    const token = new RegExp(`{{\\s*${clave}\\s*}}`, 'g');
    resultado = resultado.replace(token, valor ?? '');
  }

  return resultado;
}