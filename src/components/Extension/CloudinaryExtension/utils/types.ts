type ResourceType = 'auto' | 'image' | 'video' | 'raw'
type SourceType =
  | 'local'
  | 'url'
  | 'camera'
  | 'dropbox'
  | 'image_search'
  | 'facebook'
  | 'instagram'
  | 'shutterstock'
  | 'gettyimages'
  | 'istock'
  | 'unsplash'
  | 'google_drive'

export interface WidgetOptions {
  cloudName: string
  uploadPreset: string
  multiple?: boolean
  maxFiles?: number
  folder?: string
  tags?: string[]
  sources?: SourceType[]
  resourceType?: ResourceType
  clientAllowedFormats?: string[]
  maxFileSize?: number
  maxImageFileSize?: number
  maxVideoFileSize?: number
  context?: Record<string, string>
}
