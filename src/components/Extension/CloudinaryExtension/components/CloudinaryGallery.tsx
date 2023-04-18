import { CloudinaryPhoto } from './'

interface CloudinaryGalleryProps {
  cloudName: string
  imagesUploaded: Array<string>
}

export const CloudinaryGallery = ({
  imagesUploaded,
  cloudName,
}: CloudinaryGalleryProps) => {
  return (
    <div className="photos">
      {imagesUploaded && imagesUploaded.length === 0 && (
        <p>No photos were added yet.</p>
      )}
      {imagesUploaded &&
        imagesUploaded.length !== 0 &&
        imagesUploaded.map((publicId) => {
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
