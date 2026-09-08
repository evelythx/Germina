import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Planta = {
  id: string;
  nome: string;
  especie: string;
  dataPlantio: string;
  observacoes: string;
};

export default function DetalhesPlantaScreen() {
  const { id } = useLocalSearchParams();
  const [planta, setPlanta] = useState<Planta | null>(null);

  useEffect(() => {
    carregarPlanta();
  }, []);

  async function carregarPlanta() {
    try {
      const plantasSalvas = await AsyncStorage.getItem('plantas');

      if (plantasSalvas) {
        const plantas: Planta[] = JSON.parse(plantasSalvas);

        const plantaEncontrada = plantas.find(
          (item) => item.id === id
        );

        if (plantaEncontrada) {
          setPlanta(plantaEncontrada);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar planta:', error);
    }
  }

  if (!planta) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Planta não encontrada</Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        🌿 {planta.nome}
      </Text>

      <Text style={styles.species}>
        {planta.especie}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💧 Próxima rega</Text>

        <Text style={styles.cardHighlight}>
          Em breve
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Data de plantio</Text>

        <Text style={styles.cardText}>
          {planta.dataPlantio}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Observações</Text>

        <Text style={styles.cardText}>
          {planta.observacoes || 'Nenhuma observação adicionada.'}
        </Text>
      </View>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>Voltar</Text>
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 6,
  },

  species: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },

  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    backgroundColor: '#F3EBDD',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 10,
  },

  cardHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#234D3C',
  },

  cardText: {
    fontSize: 16,
    color: '#555555',
  },

  backText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#234D3C',
    marginTop: 10,
  },
});