import { faker } from '@faker-js/faker'
import { formatDate } from '../../src/utils'
import { Activity, ActivityObjectType, ActivityStatus } from '../types'

const activity = (props?: Partial<Activity>): Activity => {
  return {
    id: faker.string.uuid(),
    date: formatDate(new Date()) ?? '',
    status: ActivityStatus.Active,
    object: {
      id: faker.string.uuid(),
      type: ActivityObjectType.Action,
      name: faker.lorem.word(),
    },
    indirect_object: {
      id: faker.string.uuid(),
      type: ActivityObjectType.Action,
      name: faker.lorem.word(),
    },
    ...props,
  }
}

export const activity_mocks = {
  activity,
}
