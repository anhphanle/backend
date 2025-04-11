import { CreateCategoryDto } from './create-category.dto';
declare const UpdateCategoryDtoBase_base: import("@nestjs/mapped-types").MappedType<Omit<CreateCategoryDto, "parentId">>;
declare class UpdateCategoryDtoBase extends UpdateCategoryDtoBase_base {
}
export declare class UpdateCategoryDto extends UpdateCategoryDtoBase {
    parentId?: string | null;
}
export {};
