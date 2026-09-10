import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789000559846 implements MigrationInterface {
    name = 'InitialSchema1789000559846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "servicio" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text, "imagenUrl" character varying, "orden" integer, "empresaId" integer, CONSTRAINT "PK_a589f335f4fc94f913c9f86e608" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "noticia" ("id" SERIAL NOT NULL, "titulo" character varying NOT NULL, "resumen" text, "contenido" text NOT NULL, "imagenUrl" character varying, "slug" character varying NOT NULL, "publicado" boolean NOT NULL DEFAULT false, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "empresaId" integer, CONSTRAINT "UQ_b577cfa059d324dea816eedf81e" UNIQUE ("slug"), CONSTRAINT "PK_5edec4c8bedbd44a794c9145b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "correo" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "email" character varying NOT NULL, "telefono" character varying, "mensaje" text NOT NULL, "leido" boolean NOT NULL DEFAULT false, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "empresaId" integer, CONSTRAINT "PK_c29ac4976dae990a5267d5ccffd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "empresa" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "mision" text, "vision" text, "sobreNosotros" text, "porQueElegirnos" text, "logoUrl" character varying, "telefonoContacto" character varying, "emailContacto" character varying, "direccion" character varying, "whatsappNumero" character varying, "facebookUrl" character varying, "instagramUrl" character varying, "youtubeUrl" character varying, "plantillaCorreoHtml" text, CONSTRAINT "PK_bee78e8f1760ccf9cff402118a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "banner" ("id" SERIAL NOT NULL, "imagenUrl" character varying, "texto" text, "textoBoton" character varying, "linkDestino" character varying, "activo" boolean NOT NULL DEFAULT true, "orden" integer, "empresaId" integer, CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "nombre" character varying NOT NULL, "rol" character varying NOT NULL DEFAULT 'admin', "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "empresaId" integer, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "servicio" ADD CONSTRAINT "FK_881e7458ae7e3aedb3950a63d62" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "noticia" ADD CONSTRAINT "FK_528d9495200f98bd1dab175dfb6" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "correo" ADD CONSTRAINT "FK_bdec5ce978d799c8f9f90aeeb77" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "banner" ADD CONSTRAINT "FK_8a8f227aa641b8b6a8d352242e4" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_b3acdebaaf30f89a2ed589d989c" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_b3acdebaaf30f89a2ed589d989c"`);
        await queryRunner.query(`ALTER TABLE "banner" DROP CONSTRAINT "FK_8a8f227aa641b8b6a8d352242e4"`);
        await queryRunner.query(`ALTER TABLE "correo" DROP CONSTRAINT "FK_bdec5ce978d799c8f9f90aeeb77"`);
        await queryRunner.query(`ALTER TABLE "noticia" DROP CONSTRAINT "FK_528d9495200f98bd1dab175dfb6"`);
        await queryRunner.query(`ALTER TABLE "servicio" DROP CONSTRAINT "FK_881e7458ae7e3aedb3950a63d62"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TABLE "banner"`);
        await queryRunner.query(`DROP TABLE "empresa"`);
        await queryRunner.query(`DROP TABLE "correo"`);
        await queryRunner.query(`DROP TABLE "noticia"`);
        await queryRunner.query(`DROP TABLE "servicio"`);
    }

}
