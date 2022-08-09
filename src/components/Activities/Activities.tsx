import { FC } from 'react'
import { Activity } from './types'
import { ActivityDetails } from './ActivityDetails'
import { useCurrentActivity } from '../../hooks/activityNavigation'
import Head from 'next/head'

export const Activities: FC<{ activities: Array<Activity> }> = ({
  activities,
}) => {
  const { currentActivity } = useCurrentActivity()
  return (
    <>
      <Head>
        {/* TODO: create layout component for head */}
        <title>
          {activities[currentActivity].object.name} –{' '}
          {activities[currentActivity].container_name} – Hosted Session
        </title>
      </Head>
      <ActivityDetails
        activity={activities[currentActivity]}
        key={activities[currentActivity]?.id}
      />
    </>
  )
}
