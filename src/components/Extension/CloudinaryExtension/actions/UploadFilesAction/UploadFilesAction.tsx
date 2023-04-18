import React, { FC, useMemo, useState } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import classes from './UploadFilesAction.module.css'

import type {
  CloudinaryExtensionSettings,
  UploadFilesFields,
} from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteUploadFilesAction } from './hooks/useCompleteUploadFilesAction'
import { CloudinaryUploadWidget, CloudinaryGallery } from '../../components'
import { Cloudinary } from '@cloudinary/url-gen'

interface UploadFilesActionProps {
  activityDetails: ExtensionActivityRecord
}

export const UploadFilesAction: FC<UploadFilesActionProps> = ({
  activityDetails,
}) => {
  const [imagesUploadedList, setImagesUploadedList] = useState<string[]>([])

  const { activity_id, fields, settings } = activityDetails
  const { onSubmit } = useCompleteUploadFilesAction()

  const { cloudName, uploadPreset: uploadPresetSettings } = useMemo(
    () => mapSettingsToObject<CloudinaryExtensionSettings>(settings),
    [fields]
  )

  const {
    uploadPreset: uploadPresetActionFields,
    folder,
    tags,
  } = useMemo(
    () => mapActionFieldsToObject<UploadFilesFields>(fields),
    [fields]
  )

  const onImageUploadHandler = (publicId: string) => {
    setImagesUploadedList((prevState) => [...prevState, publicId])
  }

  return (
    <div className={classes.container}>
      <CloudinaryUploadWidget
        cloudName={cloudName}
        uploadPreset={uploadPresetActionFields ?? uploadPresetSettings}
        onImageUpload={(publicId) => onImageUploadHandler(publicId)}
      />
      <br />
      <br />
      <CloudinaryGallery
        cloudName={cloudName}
        imagesUploaded={imagesUploadedList}
      />
    </div>
  )
}

UploadFilesAction.displayName = 'UploadFilesAction'
