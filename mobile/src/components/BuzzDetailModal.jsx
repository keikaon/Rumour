import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBuzzDisplay, formatDistance } from '../lib/proximity';
import colors from '../theme/colors';

const formatTime = (expiresAt, now) => {
  if (!expiresAt) return '00:00:00';
  const diff = expiresAt - now;
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const BuzzDetailModal = ({ buzz, visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!visible) {
      setIsUnlocked(false);
      setPasswordAttempt('');
      setPasswordError(false);
      setKeyboardHeight(0);
      return undefined;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible, buzz?.id]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = e => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!buzz) return null;

  const display = getBuzzDisplay(buzz, { isUnlocked });
  const urgent = buzz.expiresAt && buzz.expiresAt - now < 3600000;

  const handlePasswordSubmit = () => {
    if (passwordAttempt === buzz.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordAttempt('');
    }
  };

  const renderBody = () => {
    if (display.tier === 3 || buzz.distance > 1000) {
      return (
        <View style={styles.centeredBody}>
          <Text style={styles.emojiLarge}>📡</Text>
          <Text style={styles.faintTitle}>Faint Signal</Text>
          <Text style={styles.bodyText}>
            Signals in <Text style={styles.bold}>{buzz.zone || 'nearby grid'}</Text>. Move closer to
            intercept data.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Keep Walking</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (display.tier === 4 || (buzz.distance > 200 && buzz.distance <= 1000)) {
      return (
        <View style={[styles.centeredBody, styles.hookBorder]}>
          <Text style={styles.emojiLarge}>🪝</Text>
          <Text style={styles.hookTitle}>Teaser Intercepted</Text>
          <View style={styles.teaserBox}>
            <Text style={styles.teaserQuote}>{buzz.teaser || display.body}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Understood</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (display.canUnlock) {
      return (
        <View style={[styles.centeredBody, styles.secretBorder]}>
          <Text style={styles.emojiLarge}>🤫</Text>
          <Text style={styles.secretTitle}>Secret Door</Text>
          {passwordError ? (
            <Text style={styles.errorText}>Access denied — try again</Text>
          ) : null}
          <TextInput
            style={styles.passwordInput}
            value={passwordAttempt}
            onChangeText={text => {
              setPasswordAttempt(text);
              setPasswordError(false);
            }}
            placeholder="Password..."
            placeholderTextColor="#71717a"
            keyboardAppearance="dark"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handlePasswordSubmit}
          />
          <TouchableOpacity style={styles.dangerButton} onPress={handlePasswordSubmit}>
            <Text style={styles.dangerButtonText}>Knock</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.walkAway}>Walk away</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {buzz.image ? (
          <Image source={{ uri: buzz.image }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={styles.heroPlaceholderIcon}>{buzz.icon || '📍'}</Text>
          </View>
        )}
        <View style={styles.detailContent}>
          <View style={styles.timerRow}>
            <View style={styles.liveDot} />
            <Text style={[styles.timer, urgent && styles.timerUrgent]}>
              {formatTime(buzz.expiresAt, now)}
            </Text>
          </View>
          <View style={styles.hostRow}>
            <Text style={styles.host}>{buzz.host || 'Unknown host'}</Text>
            {buzz.isVerifiedSource ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>★ Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.title}>{buzz.title}</Text>
          <Text style={styles.description}>{buzz.description}</Text>
          <Text style={styles.distanceMeta}>{formatDistance(buzz.distance)} away</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
          onPress={e => e.stopPropagation()}
        >
          <ScrollView
            style={styles.sheetScrollView}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
            contentContainerStyle={[
              styles.sheetScroll,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            {renderBody()}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  sheetScrollView: {
    backgroundColor: colors.surfaceElevated,
  },
  sheetScroll: {
    backgroundColor: colors.surfaceElevated,
  },
  centeredBody: {
    padding: 28,
    paddingTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  hookBorder: {
    borderBottomWidth: 6,
    borderBottomColor: '#22c55e',
  },
  secretBorder: {
    borderBottomWidth: 6,
    borderBottomColor: '#ef4444',
  },
  emojiLarge: {
    fontSize: 48,
    marginBottom: 16,
  },
  faintTitle: {
    color: '#a1a1aa',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  hookTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  bodyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bold: {
    color: '#fff',
    fontWeight: '800',
  },
  teaserBox: {
    backgroundColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  teaserQuote: {
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  secretTitle: {
    color: '#ef4444',
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  walkAway: {
    color: '#71717a',
    marginTop: 20,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroPlaceholder: {
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 64,
  },
  detailContent: {
    padding: 24,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  timer: {
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 12,
  },
  timerUrgent: {
    color: '#ef4444',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  host: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    color: '#22d3ee',
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  description: {
    color: '#a1a1aa',
    lineHeight: 22,
    marginBottom: 12,
  },
  distanceMeta: {
    color: '#71717a',
    fontSize: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#09090b',
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  secondaryButton: {
    backgroundColor: '#27272a',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default BuzzDetailModal;
