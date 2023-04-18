import {
  Configuration,
  Cloudinary as CoreCloudinary,
  Util,
} from 'cloudinary-core'

export const url = (publicId: string, options: Configuration.Options) => {
  try {
    const scOptions = Util.withSnakeCaseKeys(options)
    const cl = CoreCloudinary.new(options)
    return cl.url(publicId, scOptions)
  } catch (e) {
    return null
  }
}

export const openUploadWidget = (
  options: unknown,
  callback: (error: unknown, result: Record<string, unknown>) => void
) => {
  if (window?.cloudinary === undefined) {
    throw new Error('Cloudinary is not instantiated on window.')
  }

  //@ts-expect-error
  return window.cloudinary.openUploadWidget(options, callback)
}
