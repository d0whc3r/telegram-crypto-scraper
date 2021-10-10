module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', ['chore', 'ci', 'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'revert', 'perf']]
  },
  help: () => `
**Possible types**:
  'chore':    Change build process, tooling or dependencies.
  'ci':       Changes to our CI configuration files and scripts (example scopes: JenkinsFile, Build)
  'feat':     Adds a new feature.
  'fix':      Solves a bug.
  'docs':     Adds or alters documentation.
  'style':    Improves formatting, white-space.
  'refactor': Rewrites code without feature, performance or bug changes.
  'perf':     Improves performance.
  'test':     Adds or modifies tests.
  'revert':   Changes that reverting other changes
    `
};
