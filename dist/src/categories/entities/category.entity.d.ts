import { Attribute } from '../../attributes/entities/attribute.entity';
import { Product } from '../../products/entities/product.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    parent?: Category;
    children: Category[];
    products: Product[];
    attributes: Attribute[];
}
