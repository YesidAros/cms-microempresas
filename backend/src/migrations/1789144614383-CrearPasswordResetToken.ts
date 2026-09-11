import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearPasswordResetToken1789144614383 implements MigrationInterface {
    name = 'CrearPasswordResetToken1789144614383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_token" ("id" SERIAL NOT NULL, "tokenHash" character varying NOT NULL, "fechaExpiracion" TIMESTAMP NOT NULL, "usado" boolean NOT NULL DEFAULT false, "fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" integer, CONSTRAINT "UQ_324e592c57094c9dcfa00ddf919" UNIQUE ("tokenHash"), CONSTRAINT "PK_838af121380dfe3a6330e04f5bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_d123e93d941d96a916ba9c72795" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_d123e93d941d96a916ba9c72795"`);
        await queryRunner.query(`DROP TABLE "password_reset_token"`);
    }

}
