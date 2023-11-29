# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.4.7] - 2023-11-30
### Fixed
- Sync with `node-core` 7.0.2

## [3.4.6] - 2023-11-28
### Fixed
- Fix ipfs deployment templates path failed to resolved, issue was introduced node-core 7.0.0
- Update with node-core to fix network dictionary timeout but not fallback to config dictionary issue

## [3.4.5] - 2023-11-27
### Changed
- Update `@subql/node-core` with minor fixes

## [3.4.4] - 2023-11-16
### Fixed
- Sync with `node-core` 6.4.2, Fix incorrect enqueuedBlocks, dictionaries timing out by updating `@subql/apollo-links` (#22)

## [3.4.3] - 2023-11-15
### Added
- Support for SSL connections

## [3.4.2] - 2023-11-14
### Fixed
- Failed previous release

## [3.4.1] - 2023-11-14
### Added
- Improved filtering of account and contract addresses as well as bigints (#19)

## [3.4.0] - 2023-11-13
### Changed
- Updates to match changes in `@subql/node-core`
  - Dictionary service to use dictionary registry
  - Use yargs from node core

## [3.3.0] - 2023-11-06
### Added
- With `dictionary-query-size` now dictionary can config the query block range

### Fixed
- Sync with node-core 6.3.0 with various fixes

## [3.2.0] - 2023-11-01
### Changed
- Update `@subql/node-core` with fixes and support for endBlock feature (#8)

## [3.1.3] - 2023-10-27
### Changed
- Bump `@subql/common-concordium` version

## [3.1.2] - 2023-10-27
### Changed
- Bump `@subql/types-concordium` version

## [3.1.1] - 2023-10-26
### Fixed
- Bump release version

## [3.1.0] - null
[Unreleased]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.7...HEAD
[3.4.7]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.6...node-concordium/3.4.7
[3.4.6]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.5...node-concordium/3.4.6
[3.4.5]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.4...node-concordium/3.4.5
[3.4.4]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.3...node-concordium/3.4.4
[3.4.3]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.2...node-concordium/3.4.3
[3.4.2]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.1...node-concordium/3.4.2
[3.4.1]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.4.0...node-concordium/3.4.1
[3.4.0]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.3.0...node-concordium/3.4.0
[3.3.0]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.2.0...node-concordium/3.3.0
[3.2.0]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.1.3...node-concordium/3.2.0
[3.1.3]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.1.2...node-concordium/3.1.3
[3.1.2]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.1.1...node-concordium/3.1.2
[3.1.1]: https://github.com/subquery/subql-concordium/compare/node-concordium/3.1.0...node-concordium/3.1.1
[3.1.0]: https://github.com/subquery/subql-concordium/tag/v3.1.0
