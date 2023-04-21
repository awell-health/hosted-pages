import { Button } from '@awell_health/ui-library'
import { useScript } from '../../../../hooks/useScript'
import { openUploadWidget } from '../utils/CloudinaryService'
import { WidgetOptions } from '../utils/types'

interface CloudinaryUploadWidgetProps extends WidgetOptions {
  onImageUpload: (publicId: string) => void
}

export const CloudinaryUploadWidget = ({
  onImageUpload,
  ...widgetOptions
}: CloudinaryUploadWidgetProps) => {
  useScript('https://widget.cloudinary.com/v2.0/global/all.js')

  const uploadImageWidget = () => {
    const myUploadWidget = openUploadWidget(
      {
        ...widgetOptions,
        sources: ['local'],
      },
      function (error: unknown, result: Record<string, unknown>) {
        if (!error && result?.event === 'success') {
          //@ts-expect-error
          onImageUpload(result?.info?.public_id)
        }
      }
    )

    myUploadWidget.open()
  }

  return <Button onClick={uploadImageWidget}>Upload Image</Button>
}
