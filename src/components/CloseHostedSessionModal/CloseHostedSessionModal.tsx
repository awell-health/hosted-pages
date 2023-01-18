import { Modal, Button } from '@awell_health/ui-library'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'

interface CloseHostedSessionModalProps {
  isModalOpen: boolean
  onCloseModal: () => void
  onCloseHostedSession: () => void
}

export const CloseHostedSessionModal: FC<CloseHostedSessionModalProps> = ({
  isModalOpen,
  onCloseModal,
  onCloseHostedSession,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isModalOpen}
      title={t('session.close_modal.title')}
      description={t('session.close_modal.description')}
      onCloseModal={onCloseModal}
      icon="warning"
      buttons={[
        <Button key="cancel-button" variant="primary" onClick={onCloseModal}>
          {t('session.close_modal.cancel_button_label')}
        </Button>,
        <Button
          key="confirm-button"
          variant="tertiary"
          onClick={onCloseHostedSession}
        >
          {t('session.close_modal.confirm_button_label')}
        </Button>,
      ]}
    />
  )
}
