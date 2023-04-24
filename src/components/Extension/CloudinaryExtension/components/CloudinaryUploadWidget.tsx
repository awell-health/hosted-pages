import { Button } from '@awell_health/ui-library'
import { openUploadWidget } from '../utils/CloudinaryService'
import { UploadWidgetOptions } from '../utils/types'

interface CloudinaryUploadWidgetProps extends UploadWidgetOptions {
  onFileUpload: (publicId: string) => void
}

export const CloudinaryUploadWidget = ({
  onFileUpload: onFileUpload,
  ...widgetOptions
}: CloudinaryUploadWidgetProps) => {
  const uploadFileWidget = () => {
    const myUploadWidget = openUploadWidget(
      {
        ...widgetOptions,
        sources: ['local'],
      },
      function (error: unknown, result: Record<string, unknown>) {
        if (!error && result?.event === 'success') {
          //@ts-expect-error
          onFileUpload(result?.info?.public_id)
        }
      }
    )

    myUploadWidget.open()
  }

  return <Button onClick={uploadFileWidget}>Upload File</Button>
}
