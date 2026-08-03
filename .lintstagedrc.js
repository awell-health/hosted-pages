const path = require('path')

const toRelative = (filenames) =>
  filenames.map((f) => path.relative(process.cwd(), f))

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${toRelative(filenames).join(' --file ')}`

// Only the tests reachable from the staged files, so the hook stays fast.
const buildTestCommand = (filenames) =>
  `vitest related --run --passWithNoTests ${toRelative(filenames).join(' ')}`

module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx)': [() => 'yarn tsc --noEmit', buildTestCommand],
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  // Format MarkDown and JSON
  '**/*.(md|json)': (filenames) =>
    `yarn prettier --write ${filenames.join(' ')}`,
}
