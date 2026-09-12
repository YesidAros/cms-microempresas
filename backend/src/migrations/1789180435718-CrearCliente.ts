import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearCliente1789180435718 implements MigrationInterface {
    name = 'CrearCliente1789180435718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cliente" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "logoUrl" character varying, "autorizado" boolean NOT NULL DEFAULT false, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "empresaId" integer, CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD CONSTRAINT "FK_9791854caff20a020323a84a14d" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente" DROP CONSTRAINT "FK_9791854caff20a020323a84a14d"`);
        await queryRunner.query(`DROP TABLE "cliente"`);
    }

}
