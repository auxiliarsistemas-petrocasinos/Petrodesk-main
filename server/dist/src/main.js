"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestServer = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedServer;
const createNestServer = async () => {
    const expressInstance = (0, express_1.default)();
    expressInstance.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        next();
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance));
    app.enableCors({
        origin: '*',
        credentials: true,
    });
    await app.init();
    return expressInstance;
};
exports.createNestServer = createNestServer;
if (!process.env.VERCEL) {
    (0, exports.createNestServer)().then(server => {
        server.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    });
}
exports.default = async (req, res) => {
    if (!cachedServer) {
        cachedServer = await (0, exports.createNestServer)();
    }
    return cachedServer(req, res);
};
//# sourceMappingURL=main.js.map