import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(signInDto: Record<string, any>): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
            firstName: any;
            lastName: any;
            mustChangePassword: any;
        };
    }>;
}
