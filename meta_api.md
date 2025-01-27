# Meta Marketing API Notes

## Overview

This document provides a list of Facebook/Meta Marketing API endpoints to access various data related to advertising campaigns, ad accounts, creatives, audiences, and more.

---

## Key API Endpoints

### 1. **Ad Accounts**

- **Endpoint**: `/act_<ad_account_id>`
- **Description**: Retrieve details about ad accounts, including balance, currency, and spend cap.
- **Fields**:
  - `account_id`
  - `account_name`
  - `amount_spent`
  - `balance`
  - `currency`
  - `spend_cap`

### 2. **Campaigns**

- **Endpoint**: `/act_<ad_account_id>/campaigns`
- **Description**: Get information about campaigns, such as name, status, and objectives.
- **Fields**:
  - `name`
  - `status`
  - `objective`
  - `start_time`
  - `end_time`

### 3. **Ad Sets**

- **Endpoint**: `/act_<ad_account_id>/adsets`
- **Description**: Access details about ad sets, including targeting, budget, and schedule.
- **Fields**:
  - `name`
  - `status`
  - `targeting`
  - `budget_remaining`
  - `start_time`
  - `end_time`

### 4. **Ads**

- **Endpoint**: `/act_<ad_account_id>/ads`
- **Description**: Retrieve information about ads, including creative and status.
- **Fields**:
  - `name`
  - `status`
  - `creative`
  - `effective_status`

### 5. **Ad Creatives**

- **Endpoint**: `/act_<ad_account_id>/adcreatives`
- **Description**: Get data about ad creatives, such as images, videos, and object story specifications.
- **Fields**:
  - `name`
  - `object_story_spec`

### 6. **Insights**

- **Endpoint**: `/act_<ad_account_id>/insights`
- **Description**: Access performance metrics for campaigns, ad sets, and ads.
- **Fields** (Example):
  - `impressions`
  - `clicks`
  - `spend`
  - `ctr`
  - `cpc`
  - `cpm`

### 7. **Audiences**

- **Endpoint**: `/act_<ad_account_id>/customaudiences`
- **Description**: Manage or retrieve custom audiences and lookalike audiences.
- **Fields**:
  - `name`
  - `approximate_count`

### 8. **Pages**

- **Endpoint**: `/me/accounts`
- **Description**: Get a list of Facebook pages managed by the account.
- **Fields**:
  - `name`
  - `category`
  - `access_token`

### 9. **Videos**

- **Endpoint**: `/act_<ad_account_id>/videos`
- **Description**: Retrieve video data uploaded to the ad account.
- **Fields**:
  - `title`
  - `description`
  - `length`

### 10. **Leads**

- **Endpoint**: `/<page_id>/leadgen_forms`
- **Description**: Access data from Lead Generation Forms.
- **Fields**:
  - `name`
  - `created_time`

### 11. **Audience Network**

- **Endpoint**: `/act_<ad_account_id>/audiencenetworkanalytics`
- **Description**: Get data about ad performance in the Audience Network.
- **Fields**:
  - Metrics like `fb_ad_network_revenue`

### 12. **System Users**

- **Endpoint**: `/act_<ad_account_id>/assigned_users`
- **Description**: Retrieve a list of users with access to the ad account.
- **Fields**:
  - `user_id`
  - `role`

---

## Usage Tips

1. **Graph API Explorer**:

   - Use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to test your queries and understand the structure of the responses.

2. **Access Tokens**:

   - Ensure you have the required access tokens with the necessary permissions (e.g., `ads_read`, `ads_management`, `business_management`).

3. **Documentation**:

   - Refer to the official [Meta for Developers](https://developers.facebook.com/docs/) site for the latest updates and detailed field descriptions.

4. **Rate Limits**:
   - Be mindful of API rate limits to avoid interruptions in your queries.

---

## Download Instructions

- Save this document as a reference for the APIs you need.
- If you want to download this as a file, you can copy and save it locally as a `.txt` or `.md` file for easy sharing or integration with your project documentation.
