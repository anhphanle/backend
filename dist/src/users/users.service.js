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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
const role_entity_1 = require("../roles/entities/role.entity");
let UsersService = class UsersService {
    userRepository;
    roleRepository;
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async findByEmail(email, selectPassword = false) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.email = :email', { email });
        if (selectPassword) {
            queryBuilder.addSelect('user.passwordHash');
        }
        const user = await queryBuilder.getOne();
        return user ?? undefined;
    }
    async findById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
        return user ?? undefined;
    }
    async create(createUserDto) {
        const { email, password, roleId, ...userData } = createUserDto;
        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new common_1.ConflictException(`Email "${email}" already exists.`);
        }
        const role = await this.roleRepository.findOneBy({ id: roleId });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID "${roleId}" not found.`);
        }
        const saltRounds = 10;
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error hashing password.');
        }
        const newUser = this.userRepository.create({
            ...userData,
            email,
            passwordHash: hashedPassword,
            roleId: roleId,
            role: role,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
        });
        try {
            const savedUser = await this.userRepository.save(newUser);
            const { passwordHash, ...result } = savedUser;
            return result;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException(`Email "${email}" already exists.`);
            }
            else if (error.code === '23503') {
                throw new common_1.NotFoundException(`Role with ID "${roleId}" not found or invalid.`);
            }
            throw new common_1.InternalServerErrorException('Failed to create user.');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map