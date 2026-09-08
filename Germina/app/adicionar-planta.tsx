import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AdicionarPlantaScreen() {
  const params = useLocalSearchParams();

  const nome = params.nome?.toString() || '';
  const especie = params.especie?.toString() || '';
  const imagem = params.imagem?.toString() || '';
  const rega = params.rega?.toString() || '';

  const [dataPlantio, setDataPlantio] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  async function adicionarPlanta() {
    setErro('');

    if (nome === '') {
      setErro('Não foi possível identificar a planta.');
      return;
    }

    const novaPlanta = {
  id: Date.now().toString(),
  nome,
  especie,
  dataPlantio: dataPlantio.trim(),
  observacoes: observacoes.trim(),
  imagem,
  rega,
  dataAdicao: new Date().toISOString(),
};

    try {
      const plantasSalvas = await AsyncStorage.getItem('plantas');

      const plantas = plantasSalvas
        ? JSON.parse(plantasSalvas)
        : [];

      plantas.push(novaPlanta);

      await AsyncStorage.setItem(
        'plantas',
        JSON.stringify(plantas)
      );

      router.replace('/plantas');
    } catch (error) {
      console.log('Erro ao salvar planta:', error);
      setErro('Não foi possível salvar a planta.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Adicionar planta 🌱
      </Text>

      <Text style={styles.subtitle}>
        Confira a planta e adicione algumas informações.
      </Text>

      {imagem !== '' && (
        <Image
          source={{ uri: imagem }}
          style={styles.imagem}
          resizeMode="cover"
        />
      )}

      <View style={styles.plantaInfo}>
        <Text style={styles.nome}>
          🌿 {nome}
        </Text>

        <Text style={styles.especie}>
          {especie}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Data de plantio (opcional)"
        placeholderTextColor="#777777"
        value={dataPlantio}
        onChangeText={setDataPlantio}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Observações (opcional)"
        placeholderTextColor="#777777"
        multiline
        value={observacoes}
        onChangeText={setObservacoes}
      />

      {erro !== '' && (
        <Text style={styles.error}>
          {erro}
        </Text>
      )}

      <Pressable
        style={styles.button}
        onPress={adicionarPlanta}
      >
        <Text style={styles.buttonText}>
          Adicionar à minha lista
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.cancelText}>
          Voltar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 20,
  },

  imagem: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 15,
  },

  plantaInfo: {
    backgroundColor: '#F3EBDD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },

  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#234D3C',
  },

  especie: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 4,
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

  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  cancelText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#234D3C',
    fontWeight: 'bold',
  },
});