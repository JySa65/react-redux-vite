export interface ApiResponse<T> {
  data?: T;
  meta: {
    success: boolean;
    errors: string | string[];
  };
}

export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  meta: {
    success: boolean;
    errors: string | string[];
    pagination: {
      total: number;
      perPage: number;
      lastPage: number;
      currentPage: number;
    };
  };
}
