import React, { useEffect, useState } from 'react'; 
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Componente PesquisaScreen
const PesquisaScreen = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrcamentos, setFilteredOrcamentos] = useState([]);
  const navigation = useNavigation(); // Usar o hook de navegação

  // Função para buscar os orçamentos fechados do Firestore
  const fetchOrcamentosFechado = () => {
    const unsubscribe = firestore()
      .collection('orcamentos')
      .where('situacao', '==', 'FECHADO')
      .onSnapshot((snapshot) => {
        const orcamentosFechados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrcamentos(orcamentosFechados);
      }, (error) => {
        console.error('Erro ao buscar orçamentos: ', error);
      });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchOrcamentosFechado();
    return () => unsubscribe();
  }, []);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const filtrarOrcamentos = (termo) => {
    const termoLower = termo.toLowerCase();
    const resultadosFiltrados = orcamentos.filter((orcamento) => {
      const dataOrcamento = orcamento.dataCriacao ? formatarData(orcamento.dataCriacao) : '';
      return (
        orcamento.nome.toLowerCase().includes(termoLower) ||
        orcamento.dataCriacao.toLowerCase().includes(termoLower) ||
        orcamento.placa.toLowerCase().includes(termoLower) ||
        orcamento.pecas?.some((peca) => typeof peca === 'string' && peca.toLowerCase().includes(termoLower)) ||
        orcamento.servicos?.some((servico) => typeof servico === 'string' && servico.toLowerCase().includes(termoLower)) ||
        dataOrcamento.includes(termoLower)
      );
    });
  
    setFilteredOrcamentos(resultadosFiltrados);
  };
  

  const onSearchChange = (text) => {
    const upperCaseText = text.toUpperCase(); // Converte o texto para maiúsculas
    setSearchTerm(upperCaseText);
    filtrarOrcamentos(upperCaseText); // Usa o texto em maiúsculas para filtrar
};
  const renderOrcamento = ({ item }) => {
    const dataOrcamento = item.dataCriacao ? formatarData(item.dataCriacao) : 'Data não disponível';

    return (
      <TouchableOpacity
        style={styles.orcamentoItem}
        onPress={() => navigation.navigate('RelatorioOrcamento', { orcamento: item })}
      >
        <Text style={styles.textoOrcamento}>Data: {dataOrcamento}</Text>
        <Text style={styles.textoOrcamento}>Nome: {item.nome}</Text>
        <Text style={styles.textoOrcamento}>Modelo: {item.modelo}</Text>
        <Text style={styles.textoOrcamento}>Placa: {item.placa}</Text>
        <Text style={styles.textoOrcamento}>Total: {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={styles.textoOrcamentofechado}>Situação: {item.situacao}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Pesquisar por data, nome, placa, peças ou serviços"
        value={searchTerm}
        onChangeText={onSearchChange}
      />
      
      {filteredOrcamentos.length === 0 ? (
        <Text>Nenhum orçamento encontrado.</Text>
      ) : (
        <FlatList
          data={filteredOrcamentos}
          renderItem={renderOrcamento}
          keyExtractor={(item) => item.id}
        />
      )}
      
   
    </View>
    
  );
};

// Componente RelatorioOrcamento
const RelatorioOrcamento = ({ route }) => {
  const { orcamento } = route.params; // Obtém os dados do orçamento

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <View style={styles.relatorioContainer}>
      <Text style={styles.tituloRelatorio}>Relatório do Orçamento</Text>
      <Text style={styles.textoRelatorio}>Data: {formatarData(orcamento.dataCriacao)}</Text>
      <Text style={styles.textoRelatorio}>Nome: {orcamento.nome}</Text>
      <Text style={styles.textoRelatorio}>Modelo: {orcamento.modelo}</Text>
      <Text style={styles.textoRelatorio}>Placa: {orcamento.placa}</Text>
      <Text style={styles.textoRelatorio}>Peças: {orcamento.pecas?.join(', ') || 'Nenhuma'}</Text>
      <Text style={styles.textoRelatorio}>Serviços: {orcamento.servicos?.join(', ') || 'Nenhum'}</Text>
      <Text style={styles.textoRelatorio}>Observações: {orcamento.observacoes || 'Nenhuma'}</Text>
      <Text style={styles.textoRelatorio}>Total: {orcamento.total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#527F76',
  },
  searchBox: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  orcamentoItem: {
    backgroundColor: '#E0FFFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  textoOrcamento: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#000',
  },
  textoOrcamentofechado: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'red',
  },
  relatorioContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  tituloRelatorio: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textoRelatorio: {
    fontSize: 18,
    marginBottom: 10,
  },
});

// Exporta apenas o componente PesquisaScreen
export default PesquisaScreen;

// Certifique-se de que o RelatorioOrcamento é importado em sua configuração de navegação
export { RelatorioOrcamento };
