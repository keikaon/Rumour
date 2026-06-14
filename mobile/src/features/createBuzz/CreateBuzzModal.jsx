import React, { useRef, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBuzzStyles as styles } from "./createBuzzStyles";
import { BUZZ_TYPES, DURATION_OPTIONS, MAX_LENGTHS } from "./createBuzzTypes";
import useCreateBuzz from "./useCreateBuzz";
import useKeyboardInset from "./useKeyboardInset";

const CreateBuzzModal = ({
  visible,
  onClose,
  backendUrl,
  location,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const teaserRef = useRef(null);
  const descriptionRef = useRef(null);
  const passwordRef = useRef(null);
  const keyboardHeight = useKeyboardInset();
  const [lockedLocation, setLockedLocation] = useState(null);

  useEffect(() => {
    if (visible) {
      // capture the current user location at the moment the create sheet opens
      setLockedLocation(location || null);
    } else {
      setLockedLocation(null);
    }
  }, [visible, location]);

  const { form, updateField, resetForm, submit, submitting, error } =
    useCreateBuzz({
      backendUrl,
      // prefer the locked creation location; fall back to live location
      location: lockedLocation || location,
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    await submit();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <BlurView
          intensity={35}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Pressable
          style={[
            styles.sheet,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            accessibilityLabel="Close"
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            ref={scrollRef}
            style={styles.sheetScrollView}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            bounces={false}
            contentContainerStyle={[
              styles.sheetScroll,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            <View style={styles.headerStrip} />
            <Text style={styles.title}>Start Signal</Text>
            <Text style={styles.subtitle}>Broadcast from your coordinates</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.typeRow}>
              {BUZZ_TYPES.map((type) => {
                const active = form.type === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => updateField("type", type)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        active && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Signal title"
              placeholderTextColor="#c89aaf"
              keyboardAppearance="dark"
              value={form.title}
              maxLength={MAX_LENGTHS.title}
              returnKeyType="next"
              blurOnSubmit={false}
              onChangeText={(v) => updateField("title", v)}
              onSubmitEditing={() => teaserRef.current?.focus()}
            />

            <Text style={styles.label}>Teaser</Text>
            <TextInput
              ref={teaserRef}
              style={styles.input}
              placeholder="Cryptic hook for distant scanners"
              placeholderTextColor="#c89aaf"
              keyboardAppearance="dark"
              value={form.teaser}
              maxLength={MAX_LENGTHS.teaser}
              returnKeyType="next"
              blurOnSubmit={false}
              onChangeText={(v) => updateField("teaser", v)}
              onFocus={scrollToEnd}
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.input, styles.inputMultiline]}
              placeholder="Full intel at Tier 5 range"
              placeholderTextColor="#c89aaf"
              keyboardAppearance="dark"
              multiline
              value={form.description}
              maxLength={MAX_LENGTHS.description}
              returnKeyType="next"
              blurOnSubmit={false}
              onChangeText={(v) => updateField("description", v)}
              onFocus={scrollToEnd}
              onSubmitEditing={() => {
                if (form.isSecret) passwordRef.current?.focus();
              }}
            />

            <Text style={styles.label}>Signal duration</Text>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderHeaderText}>
                {form.durationHours}h active
              </Text>
              <Text style={styles.sliderHeaderSubtext}>
                Swipe or tap a mark to choose duration.
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width:
                        DURATION_OPTIONS.length > 1
                          ? `${((DURATION_OPTIONS.indexOf(form.durationHours) || 0) / (DURATION_OPTIONS.length - 1)) * 100}%`
                          : "100%",
                    },
                  ]}
                />
                {DURATION_OPTIONS.map((hours, index) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.sliderStep,
                      {
                        left: `${(index / (DURATION_OPTIONS.length - 1)) * 100}%`,
                      },
                      form.durationHours === hours && styles.sliderStepActive,
                    ]}
                    onPress={() => updateField("durationHours", hours)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.sliderStepDot,
                        form.durationHours === hours &&
                          styles.sliderStepDotActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left:
                        DURATION_OPTIONS.length > 1
                          ? `${((DURATION_OPTIONS.indexOf(form.durationHours) || 0) / (DURATION_OPTIONS.length - 1)) * 100}%`
                          : "100%",
                    },
                  ]}
                />
              </View>
              <View style={styles.sliderLabelsRow}>
                {DURATION_OPTIONS.map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={styles.sliderLabelWrap}
                    onPress={() => updateField("durationHours", hours)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sliderLabel,
                        form.durationHours === hours &&
                          styles.sliderLabelActive,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.hint}>
              Your signal expires in {form.durationHours} hour
              {form.durationHours > 1 ? "s" : ""}. Posting is locked to your
              current GPS position.
            </Text>

            <View style={styles.secretRow}>
              <Text style={styles.secretLabel}>Secret door</Text>
              <TouchableOpacity
                style={[styles.toggle, form.isSecret && styles.toggleOn]}
                onPress={() => updateField("isSecret", !form.isSecret)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    form.isSecret && styles.toggleKnobOn,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {form.isSecret ? (
              <>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Case-sensitive passphrase"
                  placeholderTextColor="#c89aaf"
                  keyboardAppearance="dark"
                  secureTextEntry
                  value={form.password}
                  maxLength={MAX_LENGTHS.password}
                  returnKeyType="done"
                  onChangeText={(v) => updateField("password", v)}
                  onFocus={scrollToEnd}
                />
              </>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Abort</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  submitting && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#1a013d" />
                ) : (
                  <Text style={styles.submitBtnText}>Transmit</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CreateBuzzModal;
