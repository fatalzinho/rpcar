import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; // Adicione esta linha
import { useCallback } from 'react';

export default function ClienteScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientes, setClientes] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  

  const buscarClientes = async (query) => {
    if (!query) {
      setClientes([]); // Limpa a lista de clientes se a query estiver vazia
      return;
    }
  
    try {
      // Busca por nome na coleção de clientes
      const snapshotNome = await firestore()
        .collection('clientes')
        .where('nome', '>=', query.toUpperCase())
        .where('nome', '<=', query.toUpperCase() + '\uf8ff')
        .get();
  
      // Extrair os clientes encontrados pela busca de nome
      const clientesPorNome = snapshotNome.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Busca por placa na coleção de carros
      const snapshotPlaca = await firestore()
        .collection('carros')
        .where('placa', '==', query.toUpperCase()) // Busca pela placa exata
        .get();
  
      // Verificar se há algum carro correspondente à placa e buscar o cliente vinculado
      const clientesPorPlaca = await Promise.all(
        snapshotPlaca.docs.map(async (doc) => {
          const carro = doc.data();
          const clienteSnapshot = await firestore()
            .collection('clientes')
            .doc(carro.clienteId) // Recupera o cliente usando o clienteId vinculado ao carro
            .get();
          if (clienteSnapshot.exists) {
            return { id: clienteSnapshot.id, ...clienteSnapshot.data() };
          }
          return null;
        })
      );
  
      // Filtra possíveis valores nulos de clientes que não foram encontrados
      const clientesValidosPorPlaca = clientesPorPlaca.filter((cliente) => cliente !== null);
  
      // Combina os dois arrays sem duplicatas
      const todosClientes = [...clientesPorNome, ...clientesValidosPorPlaca.filter(
        (clientePlaca) => !clientesPorNome.some((clienteNome) => clienteNome.id === clientePlaca.id)
      )];
  
      // Atualiza o estado com a lista de clientes
      setClientes(todosClientes);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };
  

  useEffect(() => {
    buscarClientes(searchQuery);
  }, [searchQuery]);

  // Efeito para zerar searchQuery sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      setSearchQuery(''); // Zera o campo de busca
    }, [])
  );

  const abrirModal = async (client) => {
    const carros = await buscarCarrosDoCliente(client.id); // Busca os carros do cliente
    setSelectedClient({ ...client, carros }); // Armazena o cliente com os carros
    setModalVisible(true); // Abre o modal
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => abrirModal(item)}>
      <Text style={styles.clientName}>Nome: {item.nome}</Text>
      <Text style={styles.clientEndereco}>Endereço: {item.endereco}</Text>
      <Text style={styles.clientEndereco}>Numero: {item.numero}</Text>
      <Text style={styles.clientEndereco}>Complemento: {item.complemento}</Text>
      <Text style={styles.clientEndereco}>Bairro: {item.bairro}</Text>
      <Text style={styles.clientCpf}>Cpf: {item.cpf}</Text>
      <Text style={styles.clientPhone}>Telefone: {item.telefone}</Text>
    </TouchableOpacity>
  );

  const buscarCarrosDoCliente = async (clienteId) => {
    try {
      const snapshot = await firestore()
        .collection('carros')
        .where('clienteId', '==', clienteId)
        .get();
  
      const carros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return carros;
    } catch (error) {
      console.error('Erro ao buscar carros:', error);
      return [];
    }
  };
  

  const renderCarros = () => {
    return selectedClient.carros.map((carro, index) => (
        <TouchableOpacity 
            key={index} 
            style={styles.carroItem} 
            onPress={() => {
                Alert.alert(
                    'Confirmar',
                    'Deseja abrir um novo orçamento para este carro?',
                    [
                        {
                            text: 'Cancelar',
                            onPress: () => console.log('Cancelado'),
                            style: 'cancel',
                        },
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('EditarOrcamento', {
                                    nome: selectedClient.nome,
                                    endereco: selectedClient.endereco,
                                    numero: selectedClient.numero,
                                    complemento: selectedClient.complemento,
                                    telefone: selectedClient.telefone,
                                    modelo: carro.modelo,
                                    placa: carro.placa,
                                    orcamento: null,
                                });
                                setModalVisible(false);
                            },
                        },
                    ],
                    { cancelable: false } // Impede que o alerta seja fechado ao clicar fora dele
                );
            }}
        >
            <Text style={styles.carroText}>Modelo: {carro.modelo}</Text>
            <Text style={styles.carroText}>Placa: {carro.placa}</Text>
        </TouchableOpacity>
    ));
};
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Buscar por Nome"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text.toUpperCase())}
      />
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.cpf}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nenhum cliente encontrado.</Text>}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedClient(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedClient && (
              <>
                <Text style={styles.modalTitle}>Detalhes do Cliente</Text>
                <Text style={styles.modalTitle2}>Nome: {selectedClient.nome}</Text>
                <Text style={styles.modalTitle2}>Endereço: {selectedClient.endereco}  ,{selectedClient.numero}</Text>
                <Text style={styles.modalTitle2}>Complemento: {selectedClient.complemento}</Text>
                <Text style={styles.modalTitle2}>Bairro: {selectedClient.bairro}</Text>
                <Text style={styles.modalTitle2}>CPF: {selectedClient.cpf}</Text>
                <Text style={styles.modalTitle2}>Telefone: {selectedClient.telefone}</Text>

                <Text style={styles.modalTraco}>==================================</Text>

                <Text style={styles.modalTitle}>Carros (clicar em um carro pra abrir novo orcamento)</Text>
                {renderCarros()}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.buttonText}>FECHAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      navigation.navigate('Cadastro', { cliente: selectedClient });
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.buttonText}>EDITAR CADASTRO</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#527F76',
    flex: 1,
    padding: 20,
  },
  searchBox: {
    borderWidth: 1,
    backgroundColor: '#E0FFFF',
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textTransform: 'uppercase',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  listItem: {
    backgroundColor: '#E0FFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  clientEndereco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  clientCpf: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  clientPhone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  carroItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   
    
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
   
    
    
  },
  modalTitle: {
    alignItems: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    
  },
  modalTitle2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    marginRight: 50,
    alignContent: 'flex-start'
    
  },
  modalTraco: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
    
    
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
  carroText: {
    fontSize: 16, // Ajuste o tamanho conforme necessário
    color: '#007bff', // Altere para a cor desejada
    fontWeight: 'bold', // Ajuste se você quiser um texto mais grosso
    marginBottom: 5, // Espaçamento entre as linhas
},
});
