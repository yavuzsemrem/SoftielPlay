const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// TanStack Query için resolver ayarları
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs', 'ts', 'tsx'],
  unstable_enablePackageExports: true,
  // React Native için platform-specific exports'u önceliklendir
  platforms: ['ios', 'android', 'native', 'web'],
};

// TanStack Query'nin gereksiz klasörlerini izleme listesinden çıkar
// Windows ve Unix path'leri için hem / hem de \ karakterlerini destekle
const pathSep = process.platform === 'win32' ? '[\\\\/]' : '/';
config.blockList = [
  // TanStack Query'nin codemods klasörlerini ignore et (geçici klasörler dahil)
  new RegExp(`.*${pathSep}@tanstack${pathSep}.*react-query.*${pathSep}.*${pathSep}build${pathSep}codemods${pathSep}.*`),
  new RegExp(`.*${pathSep}@tanstack${pathSep}.*react-query.*${pathSep}.*${pathSep}src${pathSep}__tests__${pathSep}.*`),
  new RegExp(`.*${pathSep}@tanstack${pathSep}.*react-query.*${pathSep}.*${pathSep}build${pathSep}codemods${pathSep}.*${pathSep}node_modules${pathSep}.*`),
  // Geçici npm klasörlerini de ignore et
  new RegExp(`.*${pathSep}@tanstack${pathSep}\\..*react-query.*`),
];

module.exports = config;






