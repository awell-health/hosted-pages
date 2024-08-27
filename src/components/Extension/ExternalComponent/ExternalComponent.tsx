import { FC, Suspense, useEffect, useState } from 'react'
import { loadRemote } from '@module-federation/runtime'
import { ExtensionActivityRecord } from '../../../types/generated/types-orchestration'
import { useCompleteExtensionActivity } from '../CalDotComExtension/types'

interface ExternalComponentProps {
  activityDetails: ExtensionActivityRecord
}
interface ExtensionComponentProps extends ExternalComponentProps {
  onSubmit: ReturnType<typeof useCompleteExtensionActivity>['onSubmit']
}

const ExternalComponentLoader: FC<ExternalComponentProps> = ({
  activityDetails,
}) => {
  const [Component, setComponent] =
    useState<FC<ExtensionComponentProps> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { onSubmit } = useCompleteExtensionActivity()

  useEffect(() => {
    let isMounted = true

    const loadComponent = async () => {
      const componentName = `${activityDetails.plugin_key}_${activityDetails.plugin_action_key}`
      console.log(componentName)
      try {
        const m = await loadRemote(`@extension/example`)
        console.log({ msg: 'SOSOSO', m })
        if (isMounted) {
          const mod = m as any
          setComponent(() => mod.default)
        }
      } catch (err) {
        console.log(err)
        if (isMounted) {
          setError(`Extension ${componentName} not found`)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
      setComponent(null)
      setError(null)
    }
  }, [activityDetails])

  if (error) return <p>{error}</p>
  if (Component === null) return <p>Loading...</p>
  return (
    <>
      <Suspense fallback={<p>Loading component...</p>}>
        <Component activityDetails={activityDetails} onSubmit={onSubmit} />
      </Suspense>
    </>
  )
}
export default ExternalComponentLoader
