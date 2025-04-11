import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';
export declare class UsersService {
    private readonly userRepository;
    private readonly roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    findByEmail(email: string, selectPassword?: boolean): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
}
