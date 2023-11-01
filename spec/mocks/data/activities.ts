import { faker } from '@faker-js/faker'
import { activity_mocks } from '../../mocks'
import {
  ActivityObjectType,
  ActivityStatus,
  FormDisplayMode,
} from '../../types'

const activeActivities = [
  activity_mocks.activity({
    status: ActivityStatus.Active,
    object: {
      id: faker.string.uuid(),
      type: ActivityObjectType.Message,
      name: faker.lorem.word(),
    },
  }),
  activity_mocks.activity({
    status: ActivityStatus.Active,
    form_display_mode: FormDisplayMode.Conversational,
    object: {
      id: faker.string.uuid(),
      type: ActivityObjectType.Form,
      name: faker.lorem.word(),
    },
  }),
]
