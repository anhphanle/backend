export declare enum InventoryHistorySortBy {
    CREATED_AT_ASC = "createdAt_asc",
    CREATED_AT_DESC = "createdAt_desc"
}
export declare class InventoryHistoryQueryDto {
    page?: number;
    limit?: number;
    sortBy?: InventoryHistorySortBy;
}
