// import { MigrationInterface, QueryRunner, Table } from "typeorm";

// export class CreateUsersTable20250524000000 implements MigrationInterface {
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.createTable(
//             new Table({
//                 name: "users",
//                 columns: [
//                     {
//                         name: "id",
//                         type: "uuid", // atau int, varchar, dll.
//                         isPrimary: true,
//                         generationStrategy: "uuid", // jika uuid
//                         default: "uuid_generate_v4()", // jika menggunakan ekstensi uuid-ossp di PostgreSQL
//                     },
//                     {
//                         name: "username",
//                         type: "varchar",
//                         isUnique: true,
//                     },
//                     {
//                         name: "password",
//                         type: "varchar",
//                     },
//                     {
//                         name: "created_at",
//                         type: "timestamp",
//                         default: "now()",
//                     },
//                     {
//                         name: "updated_at",
//                         type: "timestamp",
//                         default: "now()",
//                     },
//                 ],
//             }),
//             true, // ifNotExists
//         );
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.dropTable("users");
//     }
// }
