import React, { ComponentProps, FC, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { CloudinaryUpload } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import { useCompleteUploadFilesAction } from './hooks/useCompleteUploadFilesAction'
import attachmentIcon from './../../../../../assets/link.svg'
import type {
  CloudinaryExtensionSettings,
  UploadFilesFields,
} from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { isEmpty, isNil } from 'lodash'

interface UploadFilesActionProps {
  activityDetails: ExtensionActivityRecord
}

export const UploadFilesAction: FC<UploadFilesActionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()
  const { activity_id, fields, settings, pathway_id } = activityDetails
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

  const onSave: ComponentProps<typeof CloudinaryUpload>['onFinish'] =
    useCallback(
      (files) => {
        onSubmit(
          activity_id,
          files.map((file) => file.url)
        )
      },
      [activity_id, onSubmit]
    )

  return (
    <CloudinaryUpload
      cloudName={cloudName}
      uploadPreset={
        !isEmpty(uploadPresetActionFields) && !isNil(uploadPresetActionFields)
          ? uploadPresetActionFields
          : uploadPresetSettings
      }
      folder={folderActionFields ?? folderSettings}
      tags={tagsArray}
      context={{
        awellPathwayId: pathway_id,
        awellActivityId: activity_id,
      }}
      onFinish={onSave}
      text={{
        subject: t('activities.cloudinary.subject'),
        attachmentIcon: (
          <Image src={attachmentIcon} alt="" width={20} height={20} />
        ),
        attachmentLabels: {
          file: t('activities.cloudinary.file_attachment'),
          video: t('activities.cloudinary.video_attachment'),
          link: t('activities.cloudinary.link_attachment'),
        },
        fileCountHeader: (count) =>
          t('activities.cloudinary.file_count', { count }),
        buttonLabels: {
          upload: t('activities.cloudinary.cta_upload_files'),
          done: t('activities.cta_done'),
        },
      }}
    />
  )
}

UploadFilesAction.displayName = 'UploadFilesAction'
