export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccessResponse<TData> {
  data: TData;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  requestId: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}
