import React, { ComponentProps, FC, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { CloudinarySingleFileUpload } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import { useCompleteSingleUploadFileAction } from './hooks/useCompleteSingleUploadFileAction'
import attachmentIcon from './../../../../../assets/link.svg'
import type {
  CloudinaryExtensionSettings,
  UploadSingleFileFields,
} from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { isEmpty, isNil } from 'lodash'

interface UploadSingleFileActionProps {
  activityDetails: ExtensionActivityRecord
}

export const UploadSingleFileAction: FC<UploadSingleFileActionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()
  const { activity_id, fields, settings, pathway_id } = activityDetails
  const { onSubmit } = useCompleteSingleUploadFileAction()

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
    () => mapActionFieldsToObject<UploadSingleFileFields>(fields),
    [fields]
  )

  const tagsArray = useMemo(() => tags?.split(',') ?? [], [tags])

  const onSave: ComponentProps<typeof CloudinarySingleFileUpload>['onFinish'] =
    useCallback(
      (file) => {
        onSubmit(activity_id, String(file?.url))
      },
      [activity_id, onSubmit]
    )

  return (
    <CloudinarySingleFileUpload
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
        subject: t(
          'activities.cloudinary.single_file_upload_action.subject_single_file_upload'
        ),
        attachmentIcon: (
          <Image src={attachmentIcon} alt="" width={20} height={20} />
        ),
        attachmentLabels: {
          file: t('activities.cloudinary.file_attachment'),
          video: t('activities.cloudinary.video_attachment'),
          link: t('activities.cloudinary.link_attachment'),
        },
        fileCountHeader: (fileUploaded) =>
          fileUploaded
            ? t(
                'activities.cloudinary.single_file_upload_action.no_file_uploaded'
              )
            : t(
                'activities.cloudinary.single_file_upload_action.file_uploaded'
              ),
        buttonLabels: {
          upload: t(
            'activities.cloudinary.single_file_upload_action.cta_upload_file'
          ),
          done: t('activities.cta_done'),
        },
      }}
    />
  )
}

UploadSingleFileAction.displayName = 'UploadSingleFileAction'
