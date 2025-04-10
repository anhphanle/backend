import { User } from '../../users/entities/user.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
