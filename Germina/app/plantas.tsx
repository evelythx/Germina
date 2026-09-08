import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

type Planta = {
  id: string;
  nome: string;
  especie: string;
  dataPlantio: string;
  observacoes: string;
  rega: string;
  dataAdicao: string;
};

export default function PlantasScreen() {
  const [plantas, setPlantas] = useState<Planta[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarPlantas();
    }, [])
  );

  async function carregarPlantas() {
    try {
      const plantasSalvas = await AsyncStorage.getItem('plantas');

      if (plantasSalvas) {
        setPlantas(JSON.parse(plantasSalvas));
      } else {
        setPlantas([]);
      }
    } catch (error) {
      console.log('Erro ao carregar plantas:', error);
    }
  }

  function removerPlanta(planta: Planta) {
    Alert.alert(
      'Remover planta',
      `Deseja remover ${planta.nome} das suas plantas?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const novaLista = plantas.filter(
              (item) => item.id !== planta.id
            );

            setPlantas(novaLista);

            await AsyncStorage.setItem(
              'plantas',
              JSON.stringify(novaLista)
            );
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Minhas plantas 🌿
      </Text>

      <Text style={styles.subtitle}>
        Veja todas as suas plantas cadastradas.
      </Text>

      {plantas.length === 0 ? (
        <Text style={styles.emptyText}>
          Você ainda não cadastrou nenhuma planta.
        </Text>
      ) : (
        plantas.map((planta) => (
          <View
            key={planta.id}
            style={styles.plantCard}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/detalhes-planta',
                  params: { id: planta.id },
                })
              }
            >
              <Text style={styles.plantName}>
                🌿 {planta.nome}
              </Text>

              <Text style={styles.plantInfo}>
                Espécie: {planta.especie}
              </Text>

              <Text style={styles.plantInfo}>
                Plantada em: {planta.dataPlantio}
              </Text>
            </Pressable>

            <Pressable
              style={styles.removeButton}
              onPress={() => removerPlanta(planta)}
            >
              <Text style={styles.removeButtonText}>
                Remover planta
              </Text>
            </Pressable>
          </View>
        ))
      )}

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
    fontSize: 16,
    color: '#555555',
    marginBottom: 30,
  },

  plantCard: {
    borderWidth: 1,
    borderColor: '#234D3C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },

  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 8,
  },

  plantInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },

  removeButton: {
    marginTop: 14,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B00020',
    borderRadius: 10,
  },

  removeButtonText: {
    color: '#B00020',
    fontSize: 13,
    fontWeight: 'bold',
  },

  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
  },

  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#234D3C',
    marginTop: 10,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});