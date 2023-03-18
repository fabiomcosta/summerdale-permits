module.exports = {
  types: [
    {
      value: 'chore',
      name: 'chore:     Updating build tasks, package manager configs, etc',
    },
    { value: 'docs', name: 'docs:      Changes or addition to documentation' },
    {
      value: 'edit',
      name: 'edit:      Any change to the code aside from new feature or code formatting',
    },
    { value: 'feat', name: 'feat:      A new feature' },
    { value: 'fix', name: 'fix:       A bug fix' },
    { value: 'perf', name: 'perf:      Changes to enhance performance' },
    {
      value: 'refactor',
      name: 'refactor:  Refactoring code, functions, loops, etc',
    },
    {
      value: 'test',
      name: 'test:      Adding tests, refactoring test; no production code change',
    },
    {
      value: 'ci',
      name: 'ci:        Any change related to CI/CD pipelines',
    },
  ],

  // For future use:
  // scopes: [{ name: 'Core' }],

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  upperCaseSubject: false,

  // override the messages, defaults are as follows
  messages: {
    type: "Select the type of change that you're committing:",
    scope: '\nDenote the SCOPE of this change (optional but preferred):',
    customScope: 'Denote the SCOPE of this change (optional but preferred):',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    confirmCommit:
      'Are you sure you want to proceed with the commit above? (y/n)',
  },

  allowCustomScopes: true,
  // skip any questions
  skipQuestions: ['ticketNumber'],

  // limit subject length
  subjectLimit: 100,
  isTicketNumberRequired: false,
};
