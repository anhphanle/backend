import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../../roles/roles.service';
import { UsersService } from '../../users/users.service';
export declare class SeedService implements OnModuleInit {
    private readonly configService;
    private readonly rolesService;
    private readonly usersService;
    private readonly logger;
    constructor(configService: ConfigService, rolesService: RolesService, usersService: UsersService);
    onModuleInit(): Promise<void>;
    private seedRoles;
    private seedAdminUser;
}
