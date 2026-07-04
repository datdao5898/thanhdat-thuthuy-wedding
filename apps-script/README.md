# Google Apps Script wishes storage

This is the recommended setup for the public guest wishes book because it writes directly to the wedding Google Sheet without exposing private credentials in the frontend.

## Setup

1. Open the Google Sheet:
   `https://docs.google.com/spreadsheets/d/18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk/edit`
2. Go to `Extensions` -> `Apps Script`.
3. Paste the content from `apps-script/wishes.gs` into `Code.gs`.
4. Click `Deploy` -> `New deployment`.
5. Select type `Web app`.
6. Set:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
7. Deploy, authorize, and copy the Web App URL.
8. Paste that URL into `config.js`:

```js
window.WEDDING_WISHES_APP_SCRIPT_URL = "https://script.google.com/macros/s/xxxxx/exec";
```

After this, the landing page will read and write wishes through Google Apps Script.

## Sheet schema

The script creates a tab named `LoiChuc` with these columns:

```txt
Created At | Name | Message | Recipient | Source
```

The newest wishes are shown first on the landing page.
