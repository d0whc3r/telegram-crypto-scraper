module.exports = {
  branches: [
    'master',
    'next',
    'next-major',
    {
      name: 'beta',
      prerelease: true
    },
    {
      name: 'alpha',
      prerelease: true
    }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'telegram-crypto-scraper-linux', label: 'Linux binary' },
          { path: 'telegram-crypto-scraper-macos', label: 'Macos binary' },
          { path: 'telegram-crypto-scraper-win.exe', label: 'Windows binary' }
        ]
      }
    ],
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md', changelogTitle: '# Changelog' }],
    ['@semantic-release/git', { assets: ['CHANGELOG.md'] }]
  ]
};
