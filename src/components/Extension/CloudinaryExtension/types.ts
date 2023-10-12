export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export type CloudinaryExtensionSettings = {
  cloudName: string
  uploadPreset: string
  folder?: string
}

export enum ActionKey {
  UPLOAD_FILES = 'uploadFiles',
  UPLOAD_SINGLE_FILE = 'uploadSingleFile',
}

type baseUploadFileFields = {
  uploadPreset?: string
  folder?: string
  tags?: string
}

export type UploadFilesFields = baseUploadFileFields
export type UploadSingleFileFields = baseUploadFileFields
