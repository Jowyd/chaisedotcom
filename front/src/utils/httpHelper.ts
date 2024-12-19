import axios from "axios";
import { useErrorHandler } from "./errorHandler";

export const httpHelper = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

httpHelper.interceptors.response.use(
    (response) => response,
    (error) => {
        useErrorHandler().handleError(error);
        return Promise.reject(error);
    }   
);

export default httpHelper;