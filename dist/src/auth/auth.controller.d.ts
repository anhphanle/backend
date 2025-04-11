import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
    getProfile(user: User): {
        id: string;
        name: string;
        email: string;
        roleId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        role: import("../roles/entities/role.entity").Role;
        inventoryLogs: import("../inventory/entities/inventory-log.entity").InventoryLog[];
    };
}
