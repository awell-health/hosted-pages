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
}

export type UploadFilesFields = {
  uploadPreset?: string
  folder?: string
  tags?: string
}
