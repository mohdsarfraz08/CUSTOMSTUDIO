// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const { assetExts, sourceExts } = config.resolver;

  // Add '.svg' to sourceExts so that Metro processes them
  config.resolver.sourceExts = [...sourceExts, 'svg'];
  // Remove '.svg' from assetExts if it's there (generally not needed for Expo, but safe)
  config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');

  return config;
})();