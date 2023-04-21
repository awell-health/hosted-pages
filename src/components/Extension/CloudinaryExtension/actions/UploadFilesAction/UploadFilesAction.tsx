import React, { FC, useCallback, useMemo, useState } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import classes from './UploadFilesAction.module.css'

import type {
  CloudinaryExtensionSettings,
  UploadFilesFields,
} from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteUploadFilesAction } from './hooks/useCompleteUploadFilesAction'
import { CloudinaryUploadWidget, CloudinaryGallery } from '../../components'

interface UploadFilesActionProps {
  activityDetails: ExtensionActivityRecord
}

export const UploadFilesAction: FC<UploadFilesActionProps> = ({
  activityDetails,
}) => {
  const [imagesUploadedList, setImagesUploadedList] = useState<string[]>([])

  const { activity_id, fields, settings } = activityDetails
  const { onSubmit } = useCompleteUploadFilesAction()

  const {
    cloudName,
    uploadPreset: uploadPresetSettings,
    folder: folderSettings,
  } = useMemo(
    () => mapSettingsToObject<CloudinaryExtensionSettings>(settings),
    [settings]
  )

  const {
    uploadPreset: uploadPresetActionFields,
    folder: folderActionFields,
    tags,
  } = useMemo(
    () => mapActionFieldsToObject<UploadFilesFields>(fields),
    [fields]
  )

  const tagsArray = useMemo(() => tags?.split(',') ?? [], [tags])

  const onImageUploadHandler = (publicId: string) => {
    setImagesUploadedList((prevState) => [...prevState, publicId])
  }

  const onSave = useCallback(() => {
    onSubmit(activity_id, imagesUploadedList)
  }, [activity_id, imagesUploadedList, onSubmit])

  return (
    <div className={classes.container}>
      <CloudinaryUploadWidget
        cloudName={cloudName}
        uploadPreset={uploadPresetActionFields ?? uploadPresetSettings}
        folder={folderActionFields ?? folderSettings}
        tags={tagsArray}
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
