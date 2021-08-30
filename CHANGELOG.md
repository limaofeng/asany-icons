## [0.1.11](https://github.com/limaofeng/asany-icons/compare/v0.1.10...v0.1.11) (2021-08-30)


### Bug Fixes

*  lodash-es 改为 lodash ([6321ea9](https://github.com/limaofeng/asany-icons/commit/6321ea995359faf892dcb96cd9541a3fbe9de858))



## [0.1.10](https://github.com/limaofeng/asany-icons/compare/v0.1.9...v0.1.10) (2021-08-12)


### Bug Fixes

* 导入单个图标时，不做 svg2ttf 解析动作。直接返回原信息 ([2f6fde2](https://github.com/limaofeng/asany-icons/commit/2f6fde2b8e77a0d5ea2f9b2c5a712a862b6bdd31))



## [0.1.9](https://github.com/limaofeng/asany-icons/compare/v0.1.8...v0.1.9) (2021-08-12)


### Bug Fixes

* 修复导出 IconDefinition 的问题 ([f43aaf4](https://github.com/limaofeng/asany-icons/commit/f43aaf417f9680b7e93939c7612f667764455fa2))
* 修复解析单个 SVG 图标的BUG，同时导出 parseIconFile ([a6f76c3](https://github.com/limaofeng/asany-icons/commit/a6f76c3e23cd861ddbecf083b91c84f599158491))



## [0.1.8](https://github.com/limaofeng/asany-icons/compare/v0.1.7...v0.1.8) (2021-08-08)


### Bug Fixes

* 解决 svg 居中问题 ([d3fe101](https://github.com/limaofeng/asany-icons/commit/d3fe1014444c741c04124581b87cf0df1a07d9b7))



## [0.1.7](https://github.com/limaofeng/asany-icons/compare/v0.1.6...v0.1.7) (2021-08-06)


### Bug Fixes

* 避免出现 Uncaught (in promise) ([2b0a6d6](https://github.com/limaofeng/asany-icons/commit/2b0a6d6b692e6bd64eceee81d092ec54d51f4719))



## [0.1.6](https://github.com/limaofeng/asany-icons/compare/v0.1.5...v0.1.6) (2021-08-06)


### Bug Fixes

* 解决组件销毁后，依然执行 set state 的问题 ([9239460](https://github.com/limaofeng/asany-icons/commit/92394608a79a6eb9d8f1e13486b57f7ff0142f8d))


### Features

* 图标导入优化 ([98df2ea](https://github.com/limaofeng/asany-icons/commit/98df2ea15423293658229131c904de527ac81834))



## [0.1.5](https://github.com/limaofeng/asany-icons/compare/v0.1.4...v0.1.5) (2021-08-02)


### Bug Fixes

* 重复延时获取，不能使用事务，否则会出错 ([205d964](https://github.com/limaofeng/asany-icons/commit/205d964fa8f7c0ea95d3bb74252e309e06464231))



## [0.1.4](https://github.com/limaofeng/asany-icons/compare/v0.1.3...v0.1.4) (2021-08-02)


### Bug Fixes

* 延时获取本地库, 最多 5 * 250ms ([b92087a](https://github.com/limaofeng/asany-icons/commit/b92087ac99e099911d3d391c6bbd1e295feaf171))


### Features

* 默认导出 IconLibrary 与 IconTag 的类型 ([20fc49b](https://github.com/limaofeng/asany-icons/commit/20fc49b63cc58772e89789ac65b7bee274300de5))



## [0.1.3](https://github.com/limaofeng/asany-icons/compare/v0.1.2...v0.1.3) (2021-07-30)


### Features

* 支持直接导出 store 对象 ([4893cca](https://github.com/limaofeng/asany-icons/commit/4893cca6e24c984e59a473779cca92010257cad3))



## [0.1.2](https://github.com/limaofeng/asany-icons/compare/v0.1.1...v0.1.2) (2021-07-30)


### Features

* 支持本地库 ([26a1da6](https://github.com/limaofeng/asany-icons/commit/26a1da6f7caf229f8fff48ef9447f24fac3fbde9))



## [0.1.1](https://github.com/limaofeng/asany-icons/compare/v0.1.0...v0.1.1) (2021-07-30)



# 0.1.0 (2021-07-29)


### Bug Fixes

* 完善同步逻辑 ([e5fcabf](https://github.com/limaofeng/asany-icons/commit/e5fcabfa0b145911fde73da554820f87fff884b9))


### Features

* 完善 Icon 组件 ([b483dce](https://github.com/limaofeng/asany-icons/commit/b483dce05a21c24a3f03f8e4084cf49646860e27))
* 完善图标同步逻辑 ([78555c7](https://github.com/limaofeng/asany-icons/commit/78555c7c3eb79751111cd70b4ac66c461d3b0149))
* 实现 useIcon ([7723dad](https://github.com/limaofeng/asany-icons/commit/7723dad0e59ba27c05b4257431c05d265ed2b51e))
* 缓存图标到 indexedDB ([9f9cf84](https://github.com/limaofeng/asany-icons/commit/9f9cf844f7c202743edc28d88959704cce26bd6a))



