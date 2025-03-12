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
        const { content_type, expires_in, file_name, config_id } = args

        const { data } = await getSignedUrl({
          variables: {
            content_type,
            expires_in,
            file_name,
            config_id,
          },
        })

        if (!data || isNil(data?.getSignedUrl)) {
          throw new Error('No data returned from getSignedUrl')
        }

        return data.getSignedUrl
      } catch (error) {
        return {
          upload_url: '',
          file_url: '',
        }
      }
    },
  ]
}
