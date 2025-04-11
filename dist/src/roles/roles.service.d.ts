import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
interface CreateRoleDto {
    name: string;
    description?: string;
}
export declare class RolesService {
    private readonly roleRepository;
    constructor(roleRepository: Repository<Role>);
    findByName(name: string): Promise<Role | undefined>;
    findById(id: string): Promise<Role | undefined>;
    create(createRoleDto: CreateRoleDto): Promise<Role>;
}
export {};
