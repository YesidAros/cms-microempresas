# Conceptos — Notas de aprendizaje

## Estructura básica de NestJS (analogía: un restaurante)

- **main.ts** — el momento de abrir el restaurante: enciende todo y pone la
  aplicación a "recibir clientes" en un puerto.
- **app.module.ts** — el organigrama del restaurante: no atiende ni cocina,
  solo declara qué personal (controladores/servicios) y qué herramientas
  externas (como la conexión a la base de datos) existen. Si algo no está
  registrado aquí, Nest no sabe que existe.
- **app.controller.ts** — el mesero: recibe el pedido (petición HTTP) en una
  "mesa" (ruta), se lo pasa a la cocina, y devuelve la respuesta. No cocina.
- **app.service.ts** — la cocina: aquí va la lógica real del negocio.