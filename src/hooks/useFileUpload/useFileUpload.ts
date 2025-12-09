import { isNil } from 'lodash'
import { useGetSignedUrlLazyQuery } from './types'
import type { GetSignedUrlQueryVariables } from './types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

export const useFileUpload = (): [
  (args: GetSignedUrlQueryVariables) => Promise<{
    upload_url: string
    file_url: string
    required_headers?: any
  }>
] => {
  const [getSignedUrl] = useGetSignedUrlLazyQuery()

  return [
    async (
      args: GetSignedUrlQueryVariables
    ): Promise<{
      upload_url: string
      file_url: string
      required_headers?: any
    }> => {
      try {
        const {
          content_type,
          expires_in,
          file_name,
          config_slug,
          activity_id,
        } = args

        // Ensure content_type is properly set
        const safeContentType = content_type || 'application/octet-stream'

        const { data } = await getSignedUrl({
          variables: {
            content_type: safeContentType,
            expires_in,
            file_name,
            config_slug,
            activity_id,
          },
        })

        if (!data || isNil(data?.getSignedUrl)) {
          throw new Error('No data returned from getSignedUrl')
        }

        return data.getSignedUrl
      } catch (error) {
        const hostedSessionError = new HostedSessionError(
          'Failed to get signed URL for file upload',
          {
            errorType: 'FILE_UPLOAD_SIGNED_URL_FAILED',
            operation: 'GetSignedUrl',
            originalError: error,
            contexts: {
              fileUpload: {
                content_type: args.content_type,
                file_name: args.file_name,
                config_slug: args.config_slug,
                activity_id: args.activity_id,
              },
              graphql: {
                query: 'GetSignedUrl',
              },
            },
          }
        )
        captureHostedSessionError(hostedSessionError)
        return {
          upload_url: '',
          file_url: '',
          required_headers: undefined,
        }
      }
    },
  ]
}
