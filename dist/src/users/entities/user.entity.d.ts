import { Role } from '../../roles/entities/role.entity';
import { InventoryLog } from '../../inventory/entities/inventory-log.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    role: Role;
    inventoryLogs: InventoryLog[];
}
