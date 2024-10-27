import axios, { AxiosInstance } from "axios";
import { useMemo, useState } from "react";

const BASE_URL = "/api/";

function getSessionToken() {
  return localStorage.getItem("sessionToken");
}

const useServer = (): {
  api: AxiosInstance;
} => {
  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(
      async (config) => {
        try {
          const sessionToken = getSessionToken();

          if (sessionToken) {
            config.headers.Authorization = `Bearer ${sessionToken}`;
          }

          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  return {
    api,
  };
};

export type APIStatus = "loading" | "success" | "failed" | "";

export const useServerStatus = () => {
  const [apiStatus, setApiStatus] = useState<APIStatus>("");

  return { apiStatus, setApiStatus };
};

export default useServer;
