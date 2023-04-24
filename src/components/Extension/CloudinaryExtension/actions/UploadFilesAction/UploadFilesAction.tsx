import React, { FC, useCallback, useMemo, useState } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import { Button } from '@awell_health/ui-library'
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
  const [uploadedFilesList, setUploadedFilesList] = useState<string[]>([])

  const { activity_id, fields, settings, pathway_id } = activityDetails
  const { onSubmit, isSubmitting } = useCompleteUploadFilesAction()

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
    setUploadedFilesList((prevState) => [...prevState, publicId])
  }

  const onSave = useCallback(() => {
    onSubmit(activity_id, uploadedFilesList)
  }, [activity_id, uploadedFilesList, onSubmit])

  return (
    <div className={classes.container}>
      <CloudinaryUploadWidget
        cloudName={cloudName}
        uploadPreset={uploadPresetActionFields ?? uploadPresetSettings}
        folder={folderActionFields ?? folderSettings}
        tags={tagsArray}
        context={{
          awellPathwayId: pathway_id,
          awellActivityId: activity_id,
        }}
        onFileUpload={onImageUploadHandler}
      />

      <br />
      <br />

      <CloudinaryGallery
        cloudName={cloudName}
        filesUploaded={uploadedFilesList}
      />

      <br />
      <br />

      <Button onClick={onSave} disabled={isSubmitting}>
        Finish
      </Button>
    </div>
  )
}

UploadFilesAction.displayName = 'UploadFilesAction'
