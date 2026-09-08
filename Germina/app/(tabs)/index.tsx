import { Image } from 'expo-image';
import plantasLocais from '../../dados/plantas.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_KEY = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;

type Planta = {
  id: number;
  common_name: string;
  scientific_name?: string[];
  other_name?: string[];
  default_image?: {
    regular_url?: string;
    medium_url?: string;
    small_url?: string;
  };
};

type DetalhesPlanta = Planta & {
  watering?: string;
  sunlight?: string[];
  description?: string;
};

type PlantaLocal = {
  id: number;
  nome: string;
  especie: string;
  pesquisa: string;
  rega: string;
  luz: string;
  dica: string;
  imagem?: string;
};


function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function encontrarPlantasLocais(texto: string) {
  const buscaNormalizada = normalizarTexto(texto);

  return plantasLocais.filter((planta) => {
    return (
      normalizarTexto(planta.nome).includes(buscaNormalizada) ||
      normalizarTexto(planta.pesquisa).includes(buscaNormalizada)
    );
  });
}

function encontrarCadastro(planta: Planta) {
  const nomeApi = normalizarTexto(planta.common_name);

  return plantasLocais.find((item) => {
    const nomePesquisa = normalizarTexto(item.pesquisa);

    return (
      nomeApi.includes(nomePesquisa) ||
      nomePesquisa.includes(nomeApi)
    );
  });
}

export default function HomeScreen() {
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState<Planta[]>([]);
  const [plantaSelecionada, setPlantaSelecionada] =
    useState<DetalhesPlanta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [erro, setErro] = useState('');
  const [proximaRega, setProximaRega] = useState('');

   async function carregarProximaRega() {
  try {
    const plantasSalvas = await AsyncStorage.getItem('plantas');

    if (!plantasSalvas) {
      setProximaRega('');
      return;
    }

    const plantas = JSON.parse(plantasSalvas);

    if (plantas.length === 0) {
      setProximaRega('');
      return;
    }

    let plantaMaisProxima = null;
    let menorDistancia = Infinity;

    for (const planta of plantas) {
      if (!planta.dataAdicao || !planta.rega) {
        continue;
      }

      const dias = parseInt(planta.rega);

      if (isNaN(dias)) {
        continue;
      }

      const dataAdicao = new Date(planta.dataAdicao);
      const proximaData = new Date(dataAdicao);

      proximaData.setDate(
        proximaData.getDate() + dias
      );

      const distancia =
        proximaData.getTime() - new Date().getTime();

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        plantaMaisProxima = {
          nome: planta.nome,
          data: proximaData,
        };
      }
    }

    if (!plantaMaisProxima) {
      setProximaRega('');
      return;
    }

    useEffect(() => {
       carregarProximaRega();
    }, []);

    const hoje = new Date();
    const data = plantaMaisProxima.data;

    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    const diferenca =
      Math.ceil(
        (data.getTime() - hoje.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (diferenca <= 0) {
      setProximaRega(
        `${plantaMaisProxima.nome} precisa ser regada hoje.`
      );
    } else if (diferenca === 1) {
      setProximaRega(
        `${plantaMaisProxima.nome} precisa ser regada amanhã.`
      );
    } else {
      setProximaRega(
        `${plantaMaisProxima.nome} — daqui a ${diferenca} dias.`
      );
    }
  } catch (error) {
    console.log('Erro ao carregar próxima rega:', error);
    setProximaRega('');
  }
}

  async function pesquisar() {
    const texto = busca.trim();

    if (texto.length < 2) {
      setErro('Digite pelo menos 2 letras.');
      setSugestoes([]);
      return;
    }

    setCarregando(true);
    setErro('');
    setPlantaSelecionada(null);

    const plantasEncontradas = encontrarPlantasLocais(texto);

    if (plantasEncontradas.length > 0) {
      const resultadosLocais: Planta[] = plantasEncontradas.map(
        (planta) => ({
          id: planta.id,
          common_name: planta.nome,
          scientific_name: [planta.especie],
        })
      );

      setSugestoes(resultadosLocais);
      setCarregando(false);
      return;
    }

    try {
      if (!API_KEY) {
        setErro('Chave da API não encontrada.');
        setSugestoes([]);
        return;
      }

      const resposta = await fetch(
        `https://www.perenual.com/api/v2/species-list?key=${API_KEY}&q=${encodeURIComponent(
          texto
        )}`
      );

      const dados = await resposta.json();

      console.log('STATUS DA BUSCA:', resposta.status);
      console.log('RESULTADO DA BUSCA:', dados);

      if (!resposta.ok) {
        throw new Error(`Erro da API: ${resposta.status}`);
      }

      if (dados.data) {
        setSugestoes(dados.data.slice(0, 5));
      } else {
        setSugestoes([]);
        setErro('Nenhuma planta encontrada.');
      }
    } catch (error) {
      console.log('ERRO NA BUSCA:', error);
      setSugestoes([]);
      setErro(
        'Não foi possível pesquisar agora. Tente novamente mais tarde.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarPlanta(planta: Planta) {
    setBusca(planta.common_name);
    setSugestoes([]);
    setCarregandoDetalhes(true);
    setErro('');

     const cadastro = plantasLocais.find(
       (item) => item.id === planta.id
    );

    if (cadastro) {
      setPlantaSelecionada({
        id: cadastro.id,
        common_name: cadastro.nome,
        scientific_name: [cadastro.especie],
        watering: cadastro.rega,
        sunlight: [cadastro.luz],
        description: cadastro.dica,
      });

      setCarregandoDetalhes(false);
      return;
    }

    try {
      const resposta = await fetch(
        `https://www.perenual.com/api/v2/species/details/${planta.id}?key=${API_KEY}`
      );

      const texto = await resposta.text();

      console.log('STATUS DETALHES:', resposta.status);
      console.log('RESPOSTA BRUTA:', texto);

      if (!resposta.ok) {
        throw new Error(`Erro da API: ${resposta.status}`);
      }

      const dados = JSON.parse(texto);

      setPlantaSelecionada(dados);
    } catch (error) {
      console.log('ERRO DETALHES:', error);
      setErro('Não foi possível carregar os detalhes da planta.');
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require('../../assets/images/germina.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.title}>Olá! 🌱</Text>

      <Text style={styles.subtitle}>
        Que bom ter você aqui.
      </Text>

      <Text style={styles.searchTitle}>
        Descubra como cuidar da sua planta
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o nome da planta"
          placeholderTextColor="#777777"
          value={busca}
          onChangeText={(texto) => {
            setBusca(texto);
            setSugestoes([]);
            setPlantaSelecionada(null);
            setErro('');
          }}
        />

        <Pressable
          style={styles.searchButton}
          onPress={pesquisar}
        >
          <Text style={styles.searchButtonText}>
            Buscar
          </Text>
        </Pressable>

        {carregando && (
          <ActivityIndicator
            size="small"
            color="#234D3C"
            style={styles.loading}
          />
        )}

        {sugestoes.length > 0 && (
          <View style={styles.suggestions}>
            {sugestoes.map((planta) => {
              const cadastro = plantasLocais.find(
                (item) => item.id === planta.id
              );

              return (
                <Pressable
                  key={planta.id}
                  style={styles.suggestion}
                  onPress={() => selecionarPlanta(planta)}
                >
                  <Text style={styles.suggestionName}>
                    🌿 {cadastro?.nome || planta.common_name}
                  </Text>

                  <Text style={styles.suggestionScientific}>
                    {cadastro?.especie ||
                      planta.scientific_name?.[0] ||
                      ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {erro !== '' && (
        <Text style={styles.error}>
          {erro}
        </Text>
      )}

      {carregandoDetalhes && (
        <View style={styles.loadingDetails}>
          <ActivityIndicator
            size="large"
            color="#234D3C"
          />

          <Text style={styles.loadingText}>
            Buscando informações da planta...
          </Text>
        </View>
      )}

      {plantaSelecionada && !carregandoDetalhes && (
        <View style={styles.resultCard}>
          {plantaSelecionada.default_image?.regular_url && (
            <Image
              source={{
                uri: plantaSelecionada.default_image.regular_url,
              }}
              style={styles.plantImage}
              contentFit="cover"
            />
          )}

          <Text style={styles.resultTitle}>
            🌿 {plantaSelecionada.common_name}
          </Text>

          {plantaSelecionada.scientific_name &&
            plantaSelecionada.scientific_name.length > 0 && (
              <Text style={styles.scientificName}>
                {plantaSelecionada.scientific_name[0]}
              </Text>
            )}

          <View style={styles.infoBox}>
            <Text style={styles.resultInfoTitle}>
              💧 Rega
            </Text>

            <Text style={styles.resultInfo}>
              {plantaSelecionada.watering ||
                'Informação não disponível.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.resultInfoTitle}>
              ☀️ Luz
            </Text>

            <Text style={styles.resultInfo}>
              {plantaSelecionada.sunlight?.join(', ') ||
                'Informação não disponível.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.resultInfoTitle}>
              💡 Dica
            </Text>

            <Text style={styles.resultInfo}>
              {plantaSelecionada.description ||
                'Cuide da planta observando a umidade do solo e a iluminação do ambiente.'}
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: '/adicionar-planta',
                params: {
                  nome: plantaSelecionada.common_name,
                  especie:
                    plantaSelecionada.scientific_name?.[0] || '',
                  imagem:
                    plantaSelecionada.default_image?.regular_url ||
                    '',
                  rega: 
                    plantasLocais.find(
                      (item) => item.id === plantaSelecionada.id
                   )?.rega || plantaSelecionada.watering || '',
                },
              })
            }
          >
            <Text style={styles.addButtonText}>
              + Adicionar planta à minha lista
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.card}
        onPress={() => router.push('/plantas')}
      >
        <Text style={styles.cardTitle}>
          🌿 Minhas plantas
        </Text>

        <Text style={styles.cardText}>
          Cadastre e acompanhe suas plantas.
        </Text>

        <Text style={styles.link}>
          Ver minhas plantas →
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          💧 Próxima rega
        </Text>

       <Text style={styles.cardText}> 
        {proximaRega !== ''
           ? proximaRega
           : 'Nenhuma planta cadastrada para rega.'}
       </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  logo: {
    width: 120,
    height: 70,
    alignSelf: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 20,
  },

  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 10,
  },

  searchContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 20,
  },

  searchInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#234D3C',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#234D3C',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },

  searchButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#234D3C',
  },

  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  loading: {
    position: 'absolute',
    right: 16,
    top: 17,
  },

  suggestions: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  suggestion: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#234D3C',
  },

  suggestionScientific: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#777777',
    marginTop: 4,
  },

  resultCard: {
    backgroundColor: '#F3EBDD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  plantImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 18,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 4,
  },

  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 18,
  },

  infoBox: {
    marginBottom: 16,
  },

  resultInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 5,
  },

  resultInfo: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },

  addButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#234D3C',
    marginTop: 5,
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  loadingDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555555',
  },

  error: {
    color: '#B00020',
    fontSize: 14,
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#F3EBDD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#234D3C',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 15,
    color: '#555555',
  },

  link: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#234D3C',
  },
});