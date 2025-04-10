import { Category } from '../../categories/entities/category.entity';
import { AttributeValue } from './attribute-value.entity';
export declare class Attribute {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    values: AttributeValue[];
    categories: Category[];
}
