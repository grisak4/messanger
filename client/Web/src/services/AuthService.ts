import $api from "../http";
import {AxiosResponse} from 'axios'
import {AuthResponse} from "../mobels/response/AuthResponse";

export default class AuthService {
    static async login(email: string, password: string) : Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>(`${$api}/login`, {email, password})
    }

    static async registration(email: string, password: string) : Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>(`${$api}/regin`, {email, password})
    }
    static async logout() : Promise<void> {
        return $api.post(`${$api}/logout`)
    }
}