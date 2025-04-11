import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../../roles/roles.enum'; // Import Enum

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles); // Gán metadata 'roles' với mảng các role được phép
