# Hosted Pages

This repository contains the source code for [Awell](https://www.awell.health)'s Hosted Pages application. You can learn more about Hosted Pages [in our Developer Hub](https://developers.awellhealth.com/awell-orchestration/docs/activities/awell-hosted-pages/what-are-awell-hosted-pages).

## Translations

Hosted Pages supports multiple languages. Translations are managed with [Localazy](https://localazy.com/).

**Here is how it works:**

- English is the source language. The English translations can be found in `public/locales/en/common.json`
- When new translations keys are added, you should only update the `.../en/common.json` file. Changes to this file are detected by the CI/CD pipeline and are automatically pushed to Localazy. Note that the source of truth for the translation strings for English are also in Localazy. Any changes to translations you make in `.../en/common.json` will be overwritten with what is configured in Localazy.
- Translations for all other languages should be managed in Localazy.

### How to fetch updated Translations and deploy them

- Run the "🌐 Download Localazy translations" GitHub action. This action downloads all translations files from Localazy and creates a PR with the updated translations.
- Merge the PR into the `main` branch
- Tag a new release and deploy to all environments with the corresponding GitHub actions


