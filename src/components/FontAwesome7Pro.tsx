import { createIconSet } from '@expo/vector-icons';

// Use FA6 Pro glyph map — FA7 maintains backward-compatible codepoints for all FA6 icons,
// meaning every name/code that worked in FA6 Pro works the same way in FA7 Pro.
// The FA7 Pro font additionally includes new icons like `aperture` at the same codepoints.
const glyphMap = require('../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/FontAwesome6Pro.json');

export const FontAwesome7Pro = createIconSet(
  glyphMap,
  'FontAwesome7Pro-Regular',
  'Font Awesome 7 Pro-Regular-400.otf',
);
