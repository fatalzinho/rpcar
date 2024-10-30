import React, { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';

export default function AbertoScreen() {
  const [nome, setNome] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  
  // Estado para controlar expansão
  const [expandPeca, setExpandPeca] = useState(true);
  const [expandServico, setExpandServico] = useState(true);
  const [expandObservacao, setExpandObservacao] = useState(true);
  

  // Estado para controlar múltiplas peças e serviços
  const [pecas, setPecas] = useState([{ nomePeca: '', qtd: '', un: '' }]);
  const [servicos, setServicos] = useState([{ servico: '', qtd: '', un: '' }]);
  const [observacao, setObservacao] = useState([{ obs: '' }]);
  
  const adicionarObservacao = () => {
    setObservacao([...observacao, { obs: '' }]);
  };
  const handleObservacaoChange = (index, field, value) => {
    const updatedObservacao = [...observacao];
    updatedObservacao[index][field] = value;
    setObservacao(updatedObservacao);
  };
  // Função para adicionar uma nova linha de peças
  const adicionarPeca = () => {
    setPecas([...pecas, { nomePeca: '', qtd: '', un: '' }]);
  };

  // Função para adicionar uma nova linha de serviços
  const adicionarServico = () => {
    setServicos([...servicos, { servico: '', qtd: '', un: '' }]);
  };

  // Função para manipular o valor das peças
  const handlePecaChange = (index, field, value) => {
    const updatedPecas = [...pecas];
    updatedPecas[index][field] = value;
    setPecas(updatedPecas);
  };

  // Função para manipular o valor dos serviços
  const handleServicoChange = (index, field, value) => {
    const updatedServicos = [...servicos];
    updatedServicos[index][field] = value;
    setServicos(updatedServicos);
  };

  // Função para salvar o orçamento
  const salvarOrcamento = async () => {
    try {
      // Dados a serem salvos
      const orcamento = {
        nome,
        modelo,
        placa, // Certifica-se de que a placa está incluída
        pecas,
        servicos,
        observacao, // Inclui a observação como string
        situacao: 'ABERTO', // Situação inicial do orçamento
        dataCriacao: firestore.Timestamp.now(), // Salva a data e hora atuais
      };

      // Salvando no Firestore
      await firestore().collection('orcamentos').add(orcamento);

      console.log('Orçamento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar orçamento: ', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder="Nome"
          style={styles.inputFull}
          value={nome}
          onChangeText={setNome}
        />
      </View>
      
      {/* Modelo e Placa */}
      <View style={styles.row}>
        <TextInput
          placeholder="MODELO"
          style={styles.input}
          value={modelo}
          onChangeText={setModelo}
        />
        <TextInput
          placeholder="Placa do Veículo"
          style={styles.input}
          value={placa}
          onChangeText={setPlaca}
        />
      </View>

      {/* Seção de Peças */}
      <TouchableOpacity onPress={() => setExpandPeca(!expandPeca)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PEÇAS</Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandPeca}>
        <View style={styles.sectionContent}>
          {pecas.map((peca, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                placeholder="Nome da Peça"
                style={styles.input}
                value={peca.nomePeca}
                onChangeText={(value) => handlePecaChange(index, 'nomePeca', value)}
              />
              <TextInput
                placeholder="Qtd"
                style={styles.smallInput}
                keyboardType="numeric"
                value={peca.qtd}
                onChangeText={(value) => handlePecaChange(index, 'qtd', value)}
              />
              <TextInput
                placeholder="Un"
                style={styles.smallInput}
                keyboardType="numeric"
                value={peca.un}
                onChangeText={(value) => handlePecaChange(index, 'un', value)}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarPeca}>
            <Text style={styles.addButtonText}>+ Adicionar Peça</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Seção de Serviços */}
      <TouchableOpacity onPress={() => setExpandServico(!expandServico)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SERVIÇOS</Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandServico}>
        <View style={styles.sectionContent}>
          {servicos.map((servico, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                placeholder="Serviço"
                style={styles.input}
                value={servico.servico}
                onChangeText={(value) => handleServicoChange(index, 'servico', value)}
              />
              <TextInput
                placeholder="Qtd"
                style={styles.smallInput}
                keyboardType="numeric"
                value={servico.qtd}
                onChangeText={(value) => handleServicoChange(index, 'qtd', value)}
              />
              <TextInput
                placeholder="Un"
                style={styles.smallInput}
                keyboardType="numeric"
                value={servico.un}
                onChangeText={(value) => handleServicoChange(index, 'un', value)}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarServico}>
            <Text style={styles.addButtonText}>+ Adicionar Serviço</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Seção de Observações */}
      <TouchableOpacity
        onPress={() => setExpandObservacao(!expandObservacao)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>
          {expandObservacao ? 'OBSERVAÇÃO' : 'OBSERVAÇÃO'}
        </Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandObservacao}>
        <View style={styles.sectionContent}>
          {/* Verifique se `observacao` é um array antes de usar `.map` */}
          {Array.isArray(observacao) &&
            observacao.map((obs, index) => (
              <View key={index} style={styles.row}>
                <TextInput
                  placeholder="Observação"
                  style={[styles.inputFull, styles.textArea]} // Certifique-se de usar o estilo correto
                  value={obs.obs}
                  onChangeText={(value) => handleObservacaoChange(index, 'obs', value)}
                  multiline={true} // Permitir várias linhas
                />
              </View>
            ))}
         
        </View>
      </Collapsible>
      <Button title="Salvar Orçamento" onPress={salvarOrcamento} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    marginBottom: 10, // Adiciona um espaçamento entre as caixas de entrada
  },
  smallInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  sectionHeader: {
    backgroundColor: '#D9D9F3',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  sectionContent: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputFull: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 150, // Aumenta a altura para 100 pixels ou ajuste conforme necessário
    textAlignVertical: 'top', // Garante que o texto comece no topo da caixa de texto
  },
});
