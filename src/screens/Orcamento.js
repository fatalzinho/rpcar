import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function OrcamentoScreen({ navigation }) {
  const [orcamentos, setOrcamentos] = useState([]);

  const fetchOrcamentosAbertos = () => {
    const unsubscribe = firestore()
      .collection('orcamentos')
      .where('situacao', '==', 'ABERTO')
      .onSnapshot((snapshot) => {
        const orcamentosAbertos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrcamentos(orcamentosAbertos);
      }, (error) => {
        console.error('Erro ao buscar orçamentos: ', error);
      });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchOrcamentosAbertos();
    return () => unsubscribe();
  }, []);

  const renderOrcamento = ({ item }) => {
    const formatarData = (dataISO) => {
      const data = new Date(dataISO);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    const dataOrcamento = item.dataCriacao
      ? formatarData(item.dataCriacao)
      : 'Data não disponível';

    return (
      <View style={styles.orcamentoItem}>
        <Text style={styles.textoOrcamento}>Data: {dataOrcamento}</Text>
        <Text style={styles.textoOrcamento}>Nome: {item.nome}</Text>
        <Text style={styles.textoOrcamento}>Endereco: {item.endereco}</Text>
        <Text style={styles.textoOrcamento}>Numero: {item.numero}</Text>
        <Text style={styles.textoOrcamento}>Telefone: {item.telefone}</Text>
        <Text style={styles.textoOrcamento}>Modelo: {item.modelo}</Text>
        <Text style={styles.textoOrcamento}>Placa: {item.placa}</Text>
        <Text style={styles.textoOrcamento}>Total: {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={styles.textoOrcamentoaberto}>Situação: {item.situacao}</Text>

        {/* Botões para Editar e Relatório */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate('EditarOrcamento', { orcamento: item })}
          >
            <Text style={styles.botaoTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate('RelatorioOrcamento', { orcamento: item })}
          >
            <Text style={styles.botaoTexto}>Relatório</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {orcamentos.length === 0 ? (
        <Text>Nenhum orçamento aberto encontrado.</Text>
      ) : (
        <FlatList
          data={orcamentos}
          renderItem={renderOrcamento}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#527F76',
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
  textoOrcamentoaberto: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'green',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botao: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 5,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
