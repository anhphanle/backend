"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const roles_service_1 = require("../../roles/roles.service");
const users_service_1 = require("../../users/users.service");
const roles_enum_1 = require("../../roles/roles.enum");
let SeedService = SeedService_1 = class SeedService {
    configService;
    rolesService;
    usersService;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(configService, rolesService, usersService) {
        this.configService = configService;
        this.rolesService = rolesService;
        this.usersService = usersService;
    }
    async onModuleInit() {
        this.logger.log('Starting database seeding...');
        await this.seedRoles();
        await this.seedAdminUser();
        this.logger.log('Database seeding finished.');
    }
    async seedRoles() {
        this.logger.log('Seeding roles...');
        const rolesToSeed = Object.values(roles_enum_1.RoleEnum);
        const createdRoles = [];
        let foundAdminRole;
        for (const roleName of rolesToSeed) {
            try {
                let role = await this.rolesService.findByName(roleName);
                if (!role) {
                    this.logger.log(`Role "${roleName}" not found. Creating...`);
                    role = await this.rolesService.create({
                        name: roleName,
                        description: `${roleName} role`,
                    });
                    this.logger.log(`Role "${roleName}" created successfully.`);
                    createdRoles.push(role);
                }
                else {
                    this.logger.log(`Role "${roleName}" already exists.`);
                }
                if (role.name === roles_enum_1.RoleEnum.Admin) {
                    foundAdminRole = role;
                }
            }
            catch (error) {
                this.logger.error(`Failed to seed role "${roleName}":`, error);
            }
        }
        this.logger.log('Roles seeding complete.');
        return { adminRole: foundAdminRole, otherRoles: createdRoles };
    }
    async seedAdminUser() {
        this.logger.log('Seeding admin user...');
        const adminEmail = this.configService.get('ADMIN_EMAIL', 'admin@example.com');
        const adminPassword = this.configService.get('ADMIN_PASSWORD', 'changeme123');
        const adminName = 'Administrator';
        if (adminPassword === 'changeme123') {
            this.logger.warn('Using default admin password. Please change ADMIN_PASSWORD in your .env file!');
        }
        try {
            const adminRole = await this.rolesService.findByName(roles_enum_1.RoleEnum.Admin);
            if (!adminRole) {
                this.logger.error('Admin role not found. Cannot seed admin user.');
                return;
            }
            const existingAdminUser = await this.usersService.findByEmail(adminEmail);
            if (!existingAdminUser) {
                this.logger.log(`Admin user "${adminEmail}" not found. Creating...`);
                await this.usersService.create({
                    name: adminName,
                    email: adminEmail,
                    password: adminPassword,
                    roleId: adminRole.id,
                    isActive: true,
                });
                this.logger.log(`Admin user "${adminEmail}" created successfully.`);
            }
            else {
                this.logger.log(`Admin user "${adminEmail}" already exists.`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to seed admin user "${adminEmail}":`, error);
        }
        this.logger.log('Admin user seeding complete.');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        roles_service_1.RolesService,
        users_service_1.UsersService])
], SeedService);
//# sourceMappingURL=seed.service.js.map