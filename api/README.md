# Wedding wishes API

Endpoint `api/wishes.js` uses Google Sheets as the shared storage for guest wishes.

## Google Sheet

Default sheet id:

```txt
18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk
```

Default tab name:

```txt
LoiChuc
```

The API will create the `LoiChuc` tab and header row automatically when the service account has edit access.

## Required environment variables

Set these on the serverless host, for example Vercel:

```txt
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

Optional variables:

```txt
GOOGLE_SHEET_ID=18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk
GOOGLE_SHEET_NAME=LoiChuc
```

## Setup checklist

1. Create a Google Cloud service account.
2. Create a key for that service account and copy `client_email` and `private_key`.
3. Share the Google Sheet with the service account email as `Editor`.
4. Add the environment variables to the serverless deployment.
5. Deploy the site. Static hosting alone, such as plain GitHub Pages, cannot run this API route.
