const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro
 */
const config = getDefaultConfig(__dirname);

// Add resolver for aliases and ensure assets are resolved
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@types': path.resolve(__dirname, 'src/types'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@constants': path.resolve(__dirname, 'src/constants'),
    '@images': path.resolve(__dirname, 'src/images'),
  },
  // Ensure asset extensions are included
  assetExts: [...(config.resolver?.assetExts || []), 'png', 'jpg', 'jpeg', 'gif', 'svg'],
};

module.exports = config;
