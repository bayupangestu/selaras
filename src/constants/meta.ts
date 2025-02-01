import { Injectable } from '@nestjs/common';
import { SettingService } from '@/api/setting/setting.service';

@Injectable()
export class MetaConfig {
  constructor(private settingsService: SettingService) {}

  get META_BASE_URL(): string {
    return (
      this.settingsService.getValue('META_BASE_URL') ||
      'https://graph.facebook.com/v22.0'
    );
  }

  get META_APP_ID(): string {
    return this.settingsService.getValue('META_APP_ID') || '';
  }

  get META_APP_SECRET(): string {
    return this.settingsService.getValue('META_APP_SECRET') || '';
  }

  get ACCESS_TOKEN(): string {
    return this.settingsService.getValue('ACCESS_TOKEN') || '';
  }
}
