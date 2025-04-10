import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Attribute } from './attribute.entity';
export declare class AttributeValue {
    id: string;
    attributeId: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
    attribute: Attribute;
    variants: ProductVariant[];
}
