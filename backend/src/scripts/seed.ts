import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

async function seed() {
  const {
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
    SEED_ADMIN_NOMBRE,
    SEED_EMPRESA_NOMBRE,
  } = process.env;

  const variablesRequeridas: [string, string | undefined][] = [
    ['SEED_ADMIN_EMAIL', SEED_ADMIN_EMAIL],
    ['SEED_ADMIN_PASSWORD', SEED_ADMIN_PASSWORD],
    ['SEED_ADMIN_NOMBRE', SEED_ADMIN_NOMBRE],
    ['SEED_EMPRESA_NOMBRE', SEED_EMPRESA_NOMBRE],
  ];

  const variablesFaltantes = variablesRequeridas
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre);

  if (variablesFaltantes.length > 0) {
    console.error(
      `Faltan variables de entorno requeridas para el seed: ${variablesFaltantes.join(', ')}`,
    );
    process.exit(1);
  }

  const emailAdmin = SEED_ADMIN_EMAIL!;
  const passwordAdmin = SEED_ADMIN_PASSWORD!;
  const nombreAdmin = SEED_ADMIN_NOMBRE!;
  const nombreEmpresa = SEED_EMPRESA_NOMBRE!;

  await dataSource.initialize();

  const usuarioRepository = dataSource.getRepository(Usuario);
  const empresaRepository = dataSource.getRepository(Empresa);

  const usuarioExistente = await usuarioRepository.findOneBy({
    email: emailAdmin,
  });

  if (usuarioExistente) {
    console.log(
      `Ya existe un usuario con el email ${emailAdmin}. No se hace nada (seed idempotente).`,
    );
    await dataSource.destroy();
    return;
  }

  const empresasExistentes = await empresaRepository.find({
    order: { id: 'ASC' },
    take: 1,
  });
  let empresa = empresasExistentes[0];

  if (!empresa) {
    empresa = empresaRepository.create({ nombre: nombreEmpresa });
    empresa = await empresaRepository.save(empresa);
    console.log(`Empresa creada: "${empresa.nombre}" (id ${empresa.id})`);
  } else {
    console.log(
      `Ya existe una empresa en la base de datos ("${empresa.nombre}", id ${empresa.id}). Se usara esa para el nuevo admin.`,
    );
  }

  const passwordHasheado = await bcrypt.hash(passwordAdmin, 10);

  const nuevoAdmin = usuarioRepository.create({
    email: emailAdmin,
    password: passwordHasheado,
    nombre: nombreAdmin,
    empresa,
  });
  await usuarioRepository.save(nuevoAdmin);

  console.log(
    `Usuario admin creado correctamente: ${emailAdmin} (empresa id ${empresa.id})`,
  );

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});