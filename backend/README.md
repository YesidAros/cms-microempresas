# CMS Microempresas — Backend

API REST construida con NestJS, TypeORM y PostgreSQL para un sistema de gestión de contenido (CMS) dirigido a microempresas. Cada cliente tiene su propia instancia desplegada de forma independiente (backend + frontend + base de datos propios).


## Stack tecnológico

- **NestJS** (Node.js + TypeScript) como framework del backend.
- **PostgreSQL** como base de datos, corriendo vía Docker en desarrollo.
- **TypeORM** como ORM, con migraciones (no se usa `synchronize` en ningún ambiente).
- **JWT** (JSON Web Tokens) para autenticación.
- **Swagger/OpenAPI** para documentación interactiva de la API (solo en desarrollo).
- **Sentry** para monitoreo de errores.
- **Mailtrap/SMTP** (vía Nodemailer) para envío de correos transaccionales.

## Requisitos previos

- Node.js (versión LTS reciente)
- Docker (para levantar PostgreSQL localmente)
- Una cuenta de un servicio SMTP para pruebas (por ejemplo, Mailtrap)

## Instalación
npm install
## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (todas son validadas al arrancar la aplicación mediante un esquema Joi):

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development`, `production` o `test`. Controla comportamientos como Swagger y el CSP de Helmet. |
| `PORT` | Puerto en el que corre el servidor (por defecto 3000). |
| `DB_HOST` | Host de la base de datos PostgreSQL. |
| `DB_PORT` | Puerto de la base de datos (por defecto 5432). |
| `DB_USERNAME` | Usuario de la base de datos. |
| `DB_PASSWORD` | Contraseña de la base de datos. |
| `DB_NAME` | Nombre de la base de datos. |
| `JWT_SECRET` | Clave secreta para firmar los JWT (mínimo 16 caracteres). |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens (ej. `1d`, `12h`). |
| `FRONTEND_URL` | URL del frontend. Se usa para configurar CORS y para armar el link de recuperación de contraseña. |
| `BACKEND_URL` | URL pública del backend. |
| `SMTP_HOST` | Host del servidor SMTP para envío de correos. |
| `SMTP_PORT` | Puerto SMTP. |
| `SMTP_USER` | Usuario SMTP. |
| `SMTP_PASS` | Contraseña SMTP. |
| `SENTRY_DSN` | (Opcional) DSN de Sentry para monitoreo de errores en producción. |

Adicionalmente, el script de seed (ver más abajo) usa estas variables, que **no** forman parte del esquema de validación de la app (solo se leen al correr el seed manualmente):

| Variable | Descripción |
|---|---|
| `SEED_ADMIN_EMAIL` | Email del primer usuario administrador a crear. |
| `SEED_ADMIN_PASSWORD` | Contraseña del primer usuario administrador. |
| `SEED_ADMIN_NOMBRE` | Nombre del primer usuario administrador. |
| `SEED_EMPRESA_NOMBRE` | Nombre de la empresa a crear si aún no existe ninguna. |

## Migraciones de base de datos

Este proyecto usa migraciones de TypeORM en vez de sincronización automática del esquema.
npm run migration:generate -- src/migrations/NombreDeLaMigracion
npm run migration:run
npm run migration:revert


## Seed del primer usuario administrador

En un despliegue nuevo para un cliente, `POST /usuario` requiere estar autenticado, por lo que no hay forma de crear el primer usuario admin desde la API. Para resolver esto, existe un script de seed que crea (si hace falta) la empresa y el primer usuario administrador directamente en la base de datos:

npm run seed


Es idempotente: si ya existe un usuario con el email indicado en `SEED_ADMIN_EMAIL`, no hace nada. Si ya existe al menos una empresa en la base de datos, reutiliza esa en vez de crear una nueva.

### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run start:dev` | Levanta el servidor en modo desarrollo con recarga automática. |
| `npm run build` | Compila el proyecto a JavaScript (`dist/`). |
| `npm run start:prod` | Corre la versión compilada (producción). |
| `npm run test` | Corre la suite de tests unitarios con Jest. |
| `npm run test:cov` | Corre los tests con reporte de cobertura. |
| `npm run lint` | Corre ESLint y corrige automáticamente lo que pueda. |
| `npm run seed` | Crea el primer usuario administrador (ver sección anterior). |

## Funcionalidades principales

- **Autenticación**: login con JWT, recuperación de contraseña por correo (token de un solo uso, expira en 15 minutos), y cambio de contraseña autenticado.
- **Usuarios**: gestión de usuarios administradores, protegida completamente con autenticación.
- **Empresa**: datos generales del negocio (misión, visión, contacto, redes sociales, logo).
- **Servicios, Noticias, Banner**: contenido gestionable con subida de imágenes.
- **Clientes**: carrusel de logos de clientes, con control de autorización explícita antes de mostrarse públicamente (por temas de uso de marca).
- **Testimonios**: citas de clientes, con el mismo control de autorización antes de publicarse.
- **Correo**: envío de correos transaccionales (recuperación de contraseña, notificaciones).
- **Health check**: endpoint de estado del servicio (`@nestjs/terminus`).

## Seguridad implementada

- Todos los endpoints de escritura/administración requieren autenticación JWT (`JwtAuthGuard`).
- `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` (rechaza propiedades no esperadas en el body).
- CORS restringido únicamente a `FRONTEND_URL`.
- Validación real del contenido de archivos subidos mediante firma de bytes ("magic bytes"), no solo el mimetype declarado por el cliente (ver la sección de decisiones de diseño más abajo).
- Rate limiting (`@nestjs/throttler`) en endpoints sensibles como login y recuperación de contraseña.
- Swagger deshabilitado completamente en producción.
- Content-Security-Policy de Helmet habilitado en producción (deshabilitado en desarrollo para no interferir con Swagger UI).
- Dependencias auditadas regularmente con `npm audit` (0 vulnerabilidades conocidas al momento de escribir esto).

## Dependencias principales

### `dependencies`

| Paquete | Para qué se usa |
|---|---|
| `@nestjs/common` | Decoradores y utilidades núcleo de NestJS (controllers, guards, pipes, excepciones). |
| `@nestjs/config` | Carga y validación de variables de entorno (`ConfigModule`). |
| `@nestjs/core` | Núcleo del framework NestJS. |
| `@nestjs/jwt` | Firma y verificación de tokens JWT. |
| `@nestjs/mapped-types` | Utilidades para DTOs, como `PartialType` en los DTOs de actualización. |
| `@nestjs/passport` | Integración de Passport.js con NestJS para las estrategias de autenticación. |
| `@nestjs/platform-express` | Adaptador HTTP basado en Express. |
| `@nestjs/serve-static` | Sirve archivos estáticos (las imágenes subidas en `/uploads`). |
| `@nestjs/swagger` | Genera la documentación OpenAPI/Swagger de la API. |
| `@nestjs/terminus` | Endpoint de health check. |
| `@nestjs/throttler` | Rate limiting por IP/endpoint. |
| `@nestjs/typeorm` | Integración de TypeORM con NestJS (repositorios inyectables). |
| `@sentry/nestjs` | Reporte de errores y monitoreo en producción. |
| `bcrypt` | Hashing de contraseñas. |
| `class-transformer` | Transforma objetos planos del body a instancias de clase (usado internamente por `ValidationPipe`). |
| `class-validator` | Decoradores de validación (`@IsEmail`, `@IsString`, etc.) usados en los DTOs. |
| `helmet` | Agrega headers HTTP de seguridad (CSP, HSTS, etc.). |
| `joi` | Validación del esquema de variables de entorno al arrancar la app. |
| `nodemailer` | Envío de correos vía SMTP. |
| `passport` | Librería base de estrategias de autenticación. |
| `passport-jwt` | Estrategia de Passport para validar JWT en cada request. |
| `pg` | Driver de PostgreSQL usado por TypeORM. |
| `reflect-metadata` | Requerido por los decoradores de TypeScript que usa NestJS. |
| `rxjs` | Programación reactiva, usada internamente por NestJS. |
| `typeorm` | ORM para la base de datos (entidades, migraciones, repositorios). |

### `devDependencies`

| Paquete | Para qué se usa |
|---|---|
| `@nestjs/cli`, `@nestjs/schematics` | Herramientas de línea de comandos de Nest (generar código, build). |
| `@nestjs/testing` | Utilidades para testing de módulos NestJS (`Test.createTestingModule`). |
| `@types/*` | Tipados de TypeScript para librerías escritas en JavaScript plano. |
| `eslint`, `@eslint/js`, `@eslint/eslintrc`, `eslint-config-prettier`, `eslint-plugin-prettier`, `typescript-eslint`, `globals` | Linting y su integración con Prettier. |
| `jest`, `ts-jest` | Framework de testing y su integración con TypeScript. |
| `prettier` | Formateo automático de código. |
| `source-map-support` | Mejora los stack traces en producción, mapeándolos al código TypeScript original. |
| `supertest` | Testing de endpoints HTTP (tests end-to-end). |
| `ts-loader` | Usado internamente en el proceso de build. |
| `ts-node`, `tsconfig-paths` | Ejecutar archivos TypeScript directamente sin compilar antes (usado por las migraciones y el script de seed). |
| `typescript` | Compilador de TypeScript. |

### `overrides`

| Paquete | Motivo |
|---|---|
| `multer` → `2.3.0` | `@nestjs/platform-express` fija internamente `multer` en una versión con una vulnerabilidad conocida (reportada por `npm audit`). Se fuerza la versión parcheada sin necesidad de bajar la versión de NestJS. |

## Decisiones de diseño: por qué no usamos `file-type`

Este proyecto usa CommonJS (el estándar de módulos por defecto en NestJS/Jest), no ESM (`import`/`export` nativo de Node/navegador). Esto importa porque algunas librerías populares del ecosistema Node han migrado sus versiones más recientes a ser **exclusivamente ESM**, lo cual las hace incompatibles con Jest y con la configuración CommonJS de este proyecto sin configuración adicional.

Para la validación de archivos subidos (`src/archivos/multer-config.util.ts`) se necesitaba verificar el tipo real de un archivo a partir de su contenido binario (no solo confiar en el `mimetype` que declara el cliente, que es fácilmente falsificable). La librería estándar para esto es `file-type`, pero sus versiones recientes son ESM-only. En vez de lidiar con esa incompatibilidad o quedar pegados a una versión antigua de la librería, se implementó la validación manualmente usando únicamente los módulos nativos `fs` y `crypto` de Node — revisando las "firmas" (magic bytes) de JPEG, PNG y WEBP directamente. Esto evita depender de una librería externa para una necesidad puntual y sencilla, y elimina el problema de raíz en vez de parchearlo.

No hay, a la fecha, ningún paquete en `package.json` fijado en una versión antigua por conflictos ESM/CommonJS.

## Testing

npm run test

Todos los servicios y controllers cuentan con tests unitarios usando mocks de los repositorios de TypeORM (`getRepositoryToken`) y de los servicios inyectados.