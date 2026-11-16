import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactions1794790800000 implements MigrationInterface {
  name = 'CreateTransactions1794790800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_method_enum" AS ENUM('simulado')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('aprobada', 'rechazada')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "amount" integer NOT NULL, "method" "public"."transactions_method_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_transactions_amount_positive" CHECK ("amount" > 0), CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_orderId"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."transactions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."transactions_method_enum"`,
    );
  }
}
