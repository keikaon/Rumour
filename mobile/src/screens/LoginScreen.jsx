import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import KeyboardAwareScroll from '../components/KeyboardAwareScroll';

const LoginScreen = () => {
  const scrollRef = useRef(null);
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const scrollToActions = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAwareScroll
      ref={scrollRef}
      centerContent
      contentContainerStyle={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Rumour</Text>
        <Text style={styles.subtitle}>{isSignup ? 'Create your access key' : 'Enter your signal'}</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          keyboardAppearance="dark"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setError('');
          }}
          onSubmitEditing={() => passwordRef.current?.focus()}
          onFocus={scrollToActions}
        />

        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          keyboardAppearance="dark"
          secureTextEntry
          returnKeyType="go"
          value={password}
          onChangeText={text => {
            setPassword(text);
            setError('');
          }}
          onSubmitEditing={handleSubmit}
          onFocus={scrollToActions}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isSignup ? 'Create Account' : 'Unlock Rumour'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.toggleText}>
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScroll>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 24,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  toggleText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#fca5a5',
    marginBottom: 16,
    fontSize: 14,
  },
});

export default LoginScreen;
