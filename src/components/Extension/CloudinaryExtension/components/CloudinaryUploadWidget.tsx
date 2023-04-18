import { openUploadWidget } from '../utils/CloudinaryService'

interface CloudinaryUploadWidgetProps {
  cloudName: string
  uploadPreset: string
  onImageUpload: (publicId: string) => void
}

export const CloudinaryUploadWidget = ({
  cloudName,
  uploadPreset,
  onImageUpload,
}: CloudinaryUploadWidgetProps) => {
  const uploadImageWidget = () => {
    const myUploadWidget = openUploadWidget(
      {
        cloudName,
        uploadPreset,
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

  return <button onClick={uploadImageWidget}>Upload Image</button>
}
