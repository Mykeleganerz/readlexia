import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { HelpContentService } from './admin/help-content.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly helpContentService: HelpContentService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // Public Help Content Endpoints
  @Get('help-content')
  getAllHelpContent() {
    return this.helpContentService.getAllHelpContent();
  }

  @Get('help-content/:id')
  getHelpContentById(@Param('id') id: string) {
    return this.helpContentService.getHelpContentById(parseInt(id));
  }

  @Get('help-content/category/:category')
  getHelpContentByCategory(@Param('category') category: string) {
    return this.helpContentService.getHelpContentByCategory(category);
  }
}
