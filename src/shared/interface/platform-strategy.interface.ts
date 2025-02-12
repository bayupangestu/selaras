// export interface PlatformStrategy {
//   validateCampaign(campaignId: string): Promise<any>;
// }

export interface PlatformStrategy {
  validateCampaign(campaignId: string): Promise<any>;
  validateAdset(adsetId: string): Promise<any>;
  validateAd(adId: string): Promise<any>;
}
