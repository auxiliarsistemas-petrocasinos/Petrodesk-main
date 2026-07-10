export declare class AppController {
    getRoot(): {
        name: string;
        status: string;
        routes: {
            health: string;
            auth: string;
            dashboard: string;
            tickets: string;
            assets: string;
            users: string;
        };
    };
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
