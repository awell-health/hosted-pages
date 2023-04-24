import { CloudinaryPhoto } from './'

interface CloudinaryGalleryProps {
  cloudName: string
  filesUploaded: Array<string>
}

export const CloudinaryGallery = ({
  filesUploaded,
  cloudName,
}: CloudinaryGalleryProps) => {
  return (
    <div className="photos">
      {filesUploaded && filesUploaded.length === 0 && (
        <p>No files were added yet.</p>
      )}
      {filesUploaded?.map((publicId) => {
        return (
          <CloudinaryPhoto
            key={publicId}
            publicId={publicId}
            cloudName={cloudName}
          />
        )
      })}
    </div>
  )
}
