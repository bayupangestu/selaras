import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '@/entity/setting.entity';

@Injectable()
export class SettingService implements OnModuleInit {
  private settingsCache: Map<string, string> = new Map();

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>
  ) {}

  async onModuleInit() {
    await this.loadSettings();
  }

  private async loadSettings() {
    const settings = await this.settingsRepository.find();
    settings.forEach((setting) => {
      this.settingsCache.set(setting.key, setting.value);
    });
  }

  getValue(key: string): string | undefined {
    return this.settingsCache.get(key);
  }

  async refreshSettings() {
    await this.loadSettings();
  }

  async create(body: any) {
    const checkKey = await this.settingsRepository.findOne({
      where: {
        key: body.key
      }
    });

    if (checkKey)
      throw new HttpException(
        `${body.key} Telah Terdaftar`,
        HttpStatus.BAD_REQUEST
      );
    const newSetting = new Setting();
    newSetting.key = body.key.toUpperCase();
    newSetting.value = body.value;
    await this.settingsRepository.save(newSetting);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Setting Baru Telah Tersimpan'
    };
  }
}
