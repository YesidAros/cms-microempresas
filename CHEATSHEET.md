# Chuleta de comandos — Proyecto CMS

## Para retomar el proyecto después de un tiempo

1. Abre Docker Desktop o ejecuta desde consola
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
(espera a que arranque completo).
2. En la carpeta RAÍZ del proyecto (donde está docker-compose.yml):
   docker compose up -d
   docker ps          (confirma que cms-postgres diga "Up")
3. Entra a la carpeta backend:
   cd backend
4. Arranca el servidor de NestJS:
   npm run start:dev
5. Abre http://localhost:3000 para verificar.

## Docker
- Levantar contenedores:        docker compose up -d
- Ver contenedores corriendo:   docker ps
- Parar (sin borrar datos):     docker compose stop
- Reiniciar tras parar:         docker compose start
- Borrar contenedor y red:      docker compose down
- Borrar TODO incluidos datos:  docker compose down -v   (¡cuidado con esto!)
- Entrar a psql dentro del contenedor:
  docker exec -it cms-postgres psql -U cms_user -d cms_db

## Git
- Ver estado:              git status
- Ver remoto configurado:  git remote -v
- Agregar y confirmar:     git add .
                           git commit -m "mensaje"
- Subir a GitHub:          git push

## NestJS (dentro de la carpeta backend)
- Arrancar en modo desarrollo:  npm run start:dev
- Instalar una dependencia:     npm install <paquete>

## Comandos Consola para archivos
# Crear un archivo vacío
New-Item -ItemType File -Name "archivo.txt"

# Crear una carpeta
New-Item -ItemType Directory -Name "carpeta"

# Borrar un archivo
Remove-Item "archivo.txt"

# Borrar una carpeta y todo su contenido (¡ojo, es permanente, no va a la papelera!)
Remove-Item -Recurse -Force "carpeta"

# Renombrar
Rename-Item "nombreviejo.txt" "nombrenuevo.txt"

# Mover o copiar
Move-Item "origen.txt" "destino.txt"
Copy-Item "origen.txt" "destino.txt"
