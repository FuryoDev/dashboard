import type { AxiosInstance } from "axios";

export function createEmissionsApi(http: AxiosInstance) {
    return {
        async list() {
            const response = await http.get("/emissions");
            return response.data;
        },
    };
}