import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useState } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Usuario = {
  nome: string;
  email: string;
  senha: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleLogin() {
    setErro('');

    const emailDigitado = email.trim().toLowerCase();
    const senhaDigitada = senha.trim();

    if (emailDigitado === '') {
      setErro('Digite seu e-mail.');
      return;
    }

    if (
      !emailDigitado.includes('@') ||
      !emailDigitado.includes('.')
    ) {
      setErro('Digite um e-mail válido.');
      return;
    }

    if (senhaDigitada === '') {
      setErro('Digite sua senha.');
      return;
    }

    if (senhaDigitada.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const usuarioSalvo = await AsyncStorage.getItem('usuario');

      if (!usuarioSalvo) {
        setErro('Nenhuma conta cadastrada.');
        return;
      }

      const usuario: Usuario = JSON.parse(usuarioSalvo);

      if (
        usuario.email.toLowerCase() !== emailDigitado ||
        usuario.senha !== senhaDigitada
      ) {
        setErro('E-mail ou senha incorretos.');
        return;
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Erro ao fazer login:', error);
      setErro('Não foi possível fazer login.');
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/germina.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>
        Bem-vinda ao Germina 🌱
      </Text>

      <Text style={styles.subtitle}>
        Cuide melhor das suas plantas.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#777777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777777"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {erro !== '' && (
        <Text style={styles.error}>
          {erro}
        </Text>
      )}

      <Pressable
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Entrar
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/cadastro')}
      >
        <Text style={styles.registerText}>
          Criar uma conta
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  logo: {
    width: 220,
    height: 180,
    alignSelf: 'center',
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#234D3C',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#234D3C',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#234D3C',
    backgroundColor: '#FFFFFF',
  },

  error: {
    color: '#B00020',
    fontSize: 14,
    marginBottom: 12,
  },

  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#234D3C',
    marginTop: 8,
    marginBottom: 20,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  registerText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#234D3C',
    fontWeight: 'bold',
  },
});