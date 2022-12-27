# vite_plugin_deno_resolve

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

## 0.5.0 - 2022-12-27

### Changed

- The remote resolver has been refactored to internally use URLs for all
  resolved IDs.
- Example folder now contains the vite config.

### Fixed

- The readme has been updated with links to Deno information.

## 0.4.0 - 2022-12-23

### Added

- Readme is now populated.
- The https example now uses React from esm.sh.
- Deno CLI stdout is now visible when running Vite.

## 0.3.0 - 2022-12-23

### Added

- Calls to the Deno CLI are now cached for the duration of the session.

## 0.2.0 - 2022-12-23

### Changed

- Renamed to vite_plugin_deno_resolve

## 0.1.0 - 2022-12-23

### Added

- Initial experimental release with only https specifiers currently implemented.
