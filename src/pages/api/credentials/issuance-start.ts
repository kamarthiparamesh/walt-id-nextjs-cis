import { z } from 'zod'
import { use } from 'next-api-middleware'
import type { NextApiRequest, NextApiResponse } from 'next'
import { allowedHttpMethods } from '../../../lib/middlewares/allowed-http-methods'
import { errorHandler } from '../../../lib/middlewares/error-handler'
import { StartIssuanceInput, StartIssuanceInputClaimModeEnum, StartIssuanceResponse } from '@affinidi-tdk/credential-issuance-client'
import { CredentialsClient } from '../clients/credentials-client'

const issuanceStartSchema = z
    .object({
        credentialTypeId: z.string(),
        holderDid: z.string(),
        credentialData: z.any()
    })
    .strict()

export type IssuanceResponse = {
    credentialOfferUri: string;
    txCode?: string;
    issuanceId: string;
    expiresIn: number;
    credential_issuer: string;
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IssuanceResponse>
) {
    const {
        credentialTypeId,
        credentialData,
        holderDid,
    } = issuanceStartSchema.parse(req.body)


    try {
        const apiData: StartIssuanceInput = {
            claimMode: StartIssuanceInputClaimModeEnum.Normal,
            holderDid,
            data: [
                {
                    credentialTypeId,
                    credentialData: {
                        ...credentialData,
                        // Add any additional data here
                    },
                },
            ],
        }

        const issuanceResult = await CredentialsClient.IssuanceStart(apiData);
        console.log('IssuanceStart', issuanceResult)

        const offferResponse = {
            credential_issuer: issuanceResult.credentialOfferUri.split("\/offer")[0],
        }

        // const offferResponse = await CredentialsClient.getCredentialOffer("147b802a-0e91-459c-a41f-3549d69786a5");
        // console.log('getCredentialOffer', offferResponse)

        const resp = {
            ...issuanceResult,
            credential_issuer: offferResponse.credential_issuer
        }

        res.status(200).json(resp)
    } catch (error: any) {

        throw error
    }

}

export default use(allowedHttpMethods('POST'), errorHandler)(handler)