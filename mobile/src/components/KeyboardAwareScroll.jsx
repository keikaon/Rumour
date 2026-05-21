import React, { forwardRef, useEffect, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet } from 'react-native';
import colors from '../theme/colors';

/**
 * Scrollable screen with keyboard padding. Centers content only while keyboard is hidden.
 */
const KeyboardAwareScroll = forwardRef(function KeyboardAwareScroll(
  { children, style, contentContainerStyle, centerContent = false },
  ref
) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ScrollView
      ref={ref}
      style={[styles.flex, styles.bg, style]}
      contentContainerStyle={[
        styles.scrollContent,
        styles.bg,
        centerContent && keyboardHeight === 0 && styles.centered,
        contentContainerStyle,
        keyboardHeight > 0 && { paddingBottom: keyboardHeight + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bg: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
  },
});

export default KeyboardAwareScroll;
