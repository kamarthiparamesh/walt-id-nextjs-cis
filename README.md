
## Introduction

This is a reference app generated by Affinidi CLI tool with `nextjs` Framework, `nextauthjs` Library

## Getting started 

Setting up the reference app is easy, just follow these steps:

1. Install the dependencies:
   ```
   npm install
   ```
2. Create a `.env` file:

   ```
   cp .env.example .env
   ```

3. Set up environment variables. Please read the [configuration guide](./docs/configuration.md).

4. Launch the app:

   ```
   npm run dev
   ```

   App will be available locally on [http://localhost:3000](http://localhost:3000).



## Create CIS Configuration interoparable with Walt.id

1. Open our dev portal

2. Create a project

3. Create a wallet

4. Create a CIS Configuration using below data, note: *format* type should be `jwt_vc_json-ld`, Walt.id supports this format
```
{
    "name": "CIS Config",
    "issuerWalletId": "<your wallet id>",
    "credentialOfferDuration": 600,
    "format": "jwt_vc_json-ld",
    "credentialSupported": [
        {
            "credentialTypeId": "TestTWebinarCredentialV1R0",
            "jsonSchemaUrl": "https://schema.affinidi.io/TestTWebinarCredentialV1R0.json",
            "jsonLdContextUrl": "https://schema.affinidi.io/TestTWebinarCredentialV1R0.jsonld"
        },
        {
            "credentialTypeId": "UniversityDegree2024",
            "jsonSchemaUrl": "https://schema.affinidi.io/AnyTUniversityDegreeV1R1.json",
            "jsonLdContextUrl": "https://schema.affinidi.io/AnyTUniversityDegreeV1R1.jsonld"
        },
        {
            "credentialTypeId": "InsuranceRegistration",
            "jsonSchemaUrl": "https://schema.affinidi.io/TtestschemaIsusdfsfsfdV1R0.json",
            "jsonLdContextUrl": "https://schema.affinidi.io/TtestschemaIsusdfsfsfdV1R0.jsonld"
        },
        {
            "credentialTypeId": "AnyOnlineOrderType",
            "jsonSchemaUrl": "https://d2oeuqaac90cm.cloudfront.net/AnyTAnyOnlineOrderTypeV1R0.json",
            "jsonLdContextUrl": "https://d2oeuqaac90cm.cloudfront.net/AnyTAnyOnlineOrderTypeV1R0.jsonld"
        },
        {
            "credentialTypeId": "TOnlineOrderReceiptV1R0",
            "jsonSchemaUrl": "https://schema.affinidi.io/TOnlineOrderReceiptV1R0.json",
            "jsonLdContextUrl": "https://schema.affinidi.io/TOnlineOrderReceiptV1R0.jsonld"
        }
    ]
}
```



## Login to walt.id wallet to Create DID

1. Open our [walt.id](https://wallet.walt.id/login) and register/login 

2. Create a did:key and copy it, we will use it later to Issue the VC against to this DID
   - Post login, Click on "View wallet" 
   - Create a `did:key` by click on `New` button under `DID's` menu 
   - Click on `Create did:key` and leave other fields as is, And click the button `Create did:key` 
   - Copy your did:key e.g. `did:key:z6MkfYLsrJ2b3g4mAjtUHMpZrjZNGEYw98gUxAeA1vNiYNHF`

