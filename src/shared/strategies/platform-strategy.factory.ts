import { HttpException, Injectable } from '@nestjs/common';
import { MetaPlatformStrategy } from './meta-platform.strategy';
import { GooglePlatformStrategy } from './google-platform.strategy';
import { PlatformStrategy } from '../interface/platform-strategy.interface';

@Injectable()
export class PlatformStrategyFactory {
  constructor(
    private readonly metaPlatformStrategy: MetaPlatformStrategy,
    private readonly googlePlatformStrategy: GooglePlatformStrategy
  ) {}

  getStrategy(platformName: string): PlatformStrategy {
    switch (platformName) {
      case 'meta':
        return this.metaPlatformStrategy;
      case 'google':
        return this.googlePlatformStrategy;
      default:
        throw new HttpException('Unsupported platform', 400);
    }
  }
}
