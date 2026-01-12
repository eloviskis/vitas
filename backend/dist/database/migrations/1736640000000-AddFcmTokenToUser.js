"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFcmTokenToUser1736640000000 = void 0;
const typeorm_1 = require("typeorm");
class AddFcmTokenToUser1736640000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('users', new typeorm_1.TableColumn({
            name: 'fcmToken',
            type: 'varchar',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('users', 'fcmToken');
    }
}
exports.AddFcmTokenToUser1736640000000 = AddFcmTokenToUser1736640000000;
