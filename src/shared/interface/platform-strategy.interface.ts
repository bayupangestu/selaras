// export interface PlatformStrategy {
//   validateCampaign(campaignId: string): Promise<any>;
// }

// src/shared/interfaces/platform-strategy.interface.ts
export interface PlatformStrategy {
  validateCampaign(campaignId: string): Promise<any>;
  validateAdset(adsetId: string): Promise<any>;
  validateAd(adId: string): Promise<any>;
}
