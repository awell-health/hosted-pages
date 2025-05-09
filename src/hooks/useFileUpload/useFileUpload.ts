import { isNil } from 'lodash'
import { useGetSignedUrlLazyQuery } from './types'
import type { GetSignedUrlQueryVariables } from './types'

export const useFileUpload = (): [
  (args: GetSignedUrlQueryVariables) => Promise<{
    upload_url: string
    file_url: string
  }>
] => {
  const [getSignedUrl] = useGetSignedUrlLazyQuery()

  return [
    async (
      args: GetSignedUrlQueryVariables
    ): Promise<{
      upload_url: string
      file_url: string
    }> => {
      try {
        const { content_type, expires_in, file_name, config_slug } = args

        // Ensure content_type is properly set
        const safeContentType = content_type || 'application/octet-stream'

        const { data } = await getSignedUrl({
          variables: {
            content_type: safeContentType,
            expires_in,
            file_name,
            config_slug,
          },
        })

        if (!data || isNil(data?.getSignedUrl)) {
          throw new Error('No data returned from getSignedUrl')
        }

        return data.getSignedUrl
      } catch (error) {
        console.error('useFileUpload - Error getting signed URL:', error)
        return {
          upload_url: '',
          file_url: '',
        }
      }
    },
  ]
}
