import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import client from "./client";

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

export type ApiError = {
  status?: number;
  data?: unknown;
  errors?: string | string[];
};

export const isApiError = (error: unknown): error is ApiError =>
  !!error &&
  typeof error === "object" &&
  ("errors" in error || "status" in error || "data" in error);

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    ApiError
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await client({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data as
        | { errors?: string | string[]; error?: string }
        | undefined;
      const message = axiosError.message;
      const errors = responseData?.errors || responseData?.error || message;

      return {
        error: {
          status,
          data: responseData || message,
          errors,
        },
      };
    }
  };

export default axiosBaseQuery;
