import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreateBuzzModal from './CreateBuzzModal';
import { createBuzzStyles as styles } from './createBuzzStyles';

export function CreateBuzzFeature({ backendUrl, location, locationReady, onSuccess }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const disabled = !locationReady || !location;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: insets.bottom + 24 },
          disabled && styles.fabDisabled,
        ]}
        onPress={() => setVisible(true)}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <View style={styles.fabIcon}>
          <Text style={styles.fabIconText}>+</Text>
        </View>
        <Text style={styles.fabLabel}>Start Signal</Text>
      </TouchableOpacity>

      <CreateBuzzModal
        visible={visible}
        onClose={() => setVisible(false)}
        backendUrl={backendUrl}
        location={location}
        onSuccess={onSuccess}
      />
    </>
  );
}

export default CreateBuzzFeature;
