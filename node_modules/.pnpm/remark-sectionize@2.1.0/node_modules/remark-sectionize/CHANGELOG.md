# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-11-17
### Added
- Include TypeScript type definitions (thanks @azat-io for the [PR](https://github.com/jake-low/remark-sectionize/pull/14))

## [2.0.0] - 2023-04-17
### Changed
- Use ESM instead of CommonJS (thanks @Dahmon for the [PR](https://github.com/jake-low/remark-sectionize/pull/12))

## [1.1.1] - 2020-02-13
### Fixed
- MDX `export` nodes are no longer wrapped in section tags (which prevented them from working). Thanks @nd0ut for the [PR](https://github.com/jake-low/remark-sectionize/pull/2) and @CanRau for helping me understand the use case.

## [1.1.0] - 2019-08-27
### Added
- Section nodes now have a `depth` (thanks @shogotsuneto for the [PR](https://github.com/jake-low/remark-sectionize/pull/1))

## [1.0.1] - 2019-02-02
### Added
- Keywords in `package.json` for better discoverability on NPM

## [1.0.0] - 2019-02-01

Initial release

### Added
- core functionality to transform a remark tree, inserting section nodes
- one unit test

[Unreleased]: https://github.com/jake-low/remark-sectionize/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/jake-low/remark-sectionize/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/jake-low/remark-sectionize/compare/v1.1.0...v2.0.0
[1.1.1]: https://github.com/jake-low/remark-sectionize/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/jake-low/remark-sectionize/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/jake-low/remark-sectionize/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jake-low/remark-sectionize/releases/tag/v1.0.0
