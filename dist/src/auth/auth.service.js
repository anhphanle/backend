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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        this.logger.log(`Attempting to validate user: ${email}`);
        const user = await this.usersService.findByEmail(email, true);
        this.logger.debug(`User object retrieved for ${email}: ${JSON.stringify(user)}`);
        this.logger.debug(`Password input received for ${email} (type: ${typeof pass}): ${pass ? '[exists]' : pass}`);
        if (user) {
            this.logger.debug(`User passwordHash from DB (type: ${typeof user.passwordHash}): ${user.passwordHash ? '[exists]' : user.passwordHash}`);
        }
        if (user &&
            user.passwordHash &&
            typeof pass === 'string' &&
            pass.length > 0) {
            this.logger.log(`Proceeding to bcrypt.compare for ${email}`);
            try {
                const isMatch = await bcrypt.compare(pass, user.passwordHash);
                if (isMatch) {
                    this.logger.log(`Password matched successfully for ${email}.`);
                    const { passwordHash, ...result } = user;
                    return result;
                }
                else {
                    this.logger.warn(`Password mismatch for email: ${email}`);
                }
            }
            catch (compareError) {
                this.logger.error(`bcrypt.compare error for email ${email}:`, compareError);
                return null;
            }
        }
        else {
            this.logger.warn(`Skipping bcrypt.compare for ${email}. Reason: User found=${!!user}, Hash exists=${!!user?.passwordHash}, Password valid=${typeof pass === 'string' && pass.length > 0}`);
        }
        this.logger.warn(`Failed login attempt for email: ${email}`);
        return null;
    }
    async login(user) {
        await user.role;
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role.name,
        };
        this.logger.log(`User logged in: ${user.email}, Role: ${user.role.name}`);
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map