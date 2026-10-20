import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Defaults only. The template's R2 incremental cache is for ISR/cached pages;
// this app renders every data page on request, so there's nothing to cache.
export default defineCloudflareConfig();
