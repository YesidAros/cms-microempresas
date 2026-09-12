import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTestimonio1789182525330 implements MigrationInterface {
    name = 'CrearTestimonio1789182525330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "testimonio" ("id" SERIAL NOT NULL, "nombreAutor" character varying NOT NULL, "cargoOEmpresa" character varying, "texto" text NOT NULL, "autorizado" boolean NOT NULL DEFAULT false, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "empresaId" integer, CONSTRAINT "PK_7264a5f7a3bf109e31986611d32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "testimonio" ADD CONSTRAINT "FK_edcce752f19827556944d5fd0c9" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testimonio" DROP CONSTRAINT "FK_edcce752f19827556944d5fd0c9"`);
        await queryRunner.query(`DROP TABLE "testimonio"`);
    }

}
