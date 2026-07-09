import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Petrodesk API',
      status: 'ok',
      routes: {
        health: '/health',
        auth: '/auth',
        dashboard: '/dashboard/summary',
        tickets: '/tickets',
        assets: '/assets',
        users: '/users',
      },
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
