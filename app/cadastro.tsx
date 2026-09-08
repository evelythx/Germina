import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleCadastro() {
    setErro('');

    const nomeDigitado = nome.trim();
    const emailDigitado = email.trim().toLowerCase();
    const senhaDigitada = senha.trim();

    if (nomeDigitado === '') {
      setErro('Digite seu nome.');
      return;
    }

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

    if (confirmarSenha.trim() === '') {
      setErro('Confirme sua senha.');
      return;
    }

    if (senhaDigitada !== confirmarSenha.trim()) {
      setErro('As senhas não são iguais.');
      return;
    }

    try {
      const usuario = {
        nome: nomeDigitado,
        email: emailDigitado,
        senha: senhaDigitada,
      };

      await AsyncStorage.setItem(
        'usuario',
        JSON.stringify(usuario)
      );

      router.replace('/login');
    } catch (error) {
      console.log('Erro ao cadastrar:', error);
      setErro('Não foi possível criar sua conta.');
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
        Crie sua conta 🌱
      </Text>

      <Text style={styles.subtitle}>
        Comece a cuidar melhor das suas plantas.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#777777"
        value={nome}
        onChangeText={setNome}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        placeholderTextColor="#777777"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {erro !== '' && (
        <Text style={styles.error}>
          {erro}
        </Text>
      )}

      <Pressable
        style={styles.button}
        onPress={handleCadastro}
      >
        <Text style={styles.buttonText}>
          Criar conta
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>
          Já tenho uma conta
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
    width: 180,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20,
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
    marginBottom: 25,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#234D3C',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
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

  loginText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#234D3C',
    fontWeight: 'bold',
  },
});