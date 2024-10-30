import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useFocusEffect } from '@react-navigation/native'; // Adicione esta linha
import { useCallback } from 'react';

export default function EditarOrcamento({ route, navigation }) {
  // Pega o orçamento enviado como parâmetro, se existir
  const { orcamento } = route.params || {};

  // useEffect para atualizar os campos quando a rota mudar
  useEffect(() => {
    if (orcamento) {
      // Caso seja edição de um orçamento já existente
      setNome(orcamento.nome);
      setModelo(orcamento.modelo);
      setPlaca(orcamento.placa);
      setSituacao(orcamento.situacao);
      setPecas(orcamento.pecas);
      setServicos(orcamento.servicos);
      setObservacao(orcamento.observacao);
    } else {
      // Novo orçamento
      setNome(route.params.nome); // Pega o nome passado pela tela anterior
      setEndereco(route.params.endereco);
      setNumero(route.params.numero);
      setComplemento(route.params.complemento);
      setTelefone(route.params.telefone);
      setModelo(route.params.modelo); // Pega o modelo passado pela tela anterior
      setPlaca(route.params.placa); // Pega a placa passada pela tela anterior
      setSituacao('ABERTO'); // Novo orçamento começa sempre como "ABERTO"
      setPecas([]); // Nenhuma peça no início
      setServicos([]); // Nenhum serviço no início
      setObservacao([]); // Nenhuma observação no início
    }
  }, [orcamento]);
   // Limpa o estado quando a tela é desfocada
   useFocusEffect(
    useCallback(() => {
      return () => {
        setNome('');
        setModelo('');
        setPlaca('');
        setPecas([]);
        setServicos([]);
        setObservacao([]);
      };
    }, [])
  );

  // Funções de manipulação e sa

  // Estado inicial com dados do orçamento ou valores vazios para novo orçamento
  const [nome, setNome] = useState(orcamento ? orcamento.nome : '');
  const [endereco, setEndereco] = useState(orcamento ? orcamento.endereco : '');
  const [numero, setNumero] = useState(orcamento ? orcamento.numero : '');
  const [complemento, setComplemento] = useState(orcamento ? orcamento.complemento : '');
  const [telefone, setTelefone] = useState(orcamento ? orcamento.telefone : '');
  const [modelo, setModelo] = useState(orcamento ? orcamento.modelo : '');
  const [placa, setPlaca] = useState(orcamento ? orcamento.placa : '');
  const [situacao, setSituacao] = useState(orcamento ? orcamento.situacao : 'ABERTO');

  // Estados para controlar expansão
  const [expandedSection, setExpandedSection] = useState(null);

  // Estado para controlar múltiplas peças, serviços e observações
  const [pecas, setPecas] = useState(orcamento ? orcamento.pecas : []);
  const [servicos, setServicos] = useState(orcamento ? orcamento.servicos : []);
  const [observacao, setObservacao] = useState(orcamento ? orcamento.observacao : []);
  const [total, setTotal] = useState(0); // Estado para armazenar o total

  const calcularTotal = () => { 
    let totalPecas = pecas.reduce((acc, peca) => {
      const valorUn = parseFloat(peca.un.replace(/\./g, '').replace(',', '.'));
      return acc + (valorUn * parseInt(peca.qtd) || 0);
    }, 0);
  
    let totalServicos = servicos.reduce((acc, servico) => {
      const valorUn = parseFloat(servico.un.replace(/\./g, '').replace(',', '.'));
      return acc + (valorUn * parseInt(servico.qtd) || 0);
    }, 0);
  
    setTotal(totalPecas + totalServicos);
  };
  

  // Recalcula o total sempre que as peças ou serviços mudam
  useEffect(() => {
    calcularTotal();
  }, [pecas, servicos]);
  
  // Função para adicionar nova observação
  const adicionarObservacao = () => {
    setObservacao([...observacao, { obs: '' }]);
  };

  // Funções para gerenciar mudanças
  const handleObservacaoChange = (index, field, value) => {
    const updatedObservacao = [...observacao];
    updatedObservacao[index][field] = value.toUpperCase(); // Convertendo para maiúsculas
    setObservacao(updatedObservacao);
  };

  const adicionarPeca = () => {
    setPecas([...pecas, { nomePeca: '', qtd: '', un: '' }]);
  };

  const adicionarServico = () => {
    setServicos([...servicos, { servico: '', qtd: '', un: '' }]);
  };

  const handlePecaChange = (index, field, value) => {
    const updatedPecas = [...pecas];
    updatedPecas[index][field] = value.toUpperCase(); // Convertendo para maiúsculas
    setPecas(updatedPecas);
  };

  const handleServicoChange = (index, field, value) => {
    const updatedServicos = [...servicos];
    updatedServicos[index][field] = value.toUpperCase(); // Convertendo para maiúsculas
    setServicos(updatedServicos);
  };

  // Função para salvar ou atualizar orçamento
  const salvarOrcamento = async () => {
    try {
        if (orcamento) {
            // Atualiza o orçamento no Firestore
            await firestore().collection('orcamentos').doc(orcamento.id).update({
                nome: nome.toUpperCase(),
                modelo: modelo.toUpperCase(),
                placa: placa.toUpperCase(),
                pecas,
                servicos,
                observacao,
                total,
                situacao,
                //dataCriacao: orcamento.dataCriacao // Mantém a data de criação original
            });

            console.log('Orçamento atualizado com sucesso!');
        } else {
            // Cria um novo orçamento no Firestore
            await firestore().collection('orcamentos').add({
                nome: nome.toUpperCase(),
                endereco: endereco.toUpperCase(),
                numero,
                complemento: complemento.toUpperCase(),
                telefone,
                modelo: modelo.toUpperCase(),
                placa: placa.toUpperCase(),
                pecas,
                servicos,
                observacao,
                total,
                situacao,
                dataCriacao: new Date().toISOString() // Armazena a data e hora atual
            });

            console.log('Novo orçamento criado com sucesso!');
        }
        // Exibe uma mensagem de sucesso aqui (opcional)
        alert(orcamento ? "Orçamento atualizado com sucesso!" : "Novo orçamento criado com sucesso!");
        
        navigation.navigate('Orcamento'); // Volta para a tela anterior
    } catch (error) {
        console.error('Erro ao salvar orçamento: ', error);
        alert("Erro ao salvar orçamento. Tente novamente."); // Mensagem de erro (opcional)
    }
};

  // Função para alternar a expansão
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  const formatCurrency = (value) => {
    // Remove qualquer caractere que não seja número
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ajustar casas decimais
    const formattedNumber = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  
    return formattedNumber;
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.buttonText2}>NOME</Text>
      <View style={styles.row}>
      
        <TextInput
          placeholder="Nome"
          style={[styles.inputFull, styles.nonEditable]} // Aplica o estilo especial diretamente
          value={nome}
          editable={false} // Campo não editável
          onChangeText={(value) => setNome(value.toUpperCase())} // Convertendo para maiúsculas
        />
      </View>
      <Text style={styles.buttonText2}>CARRO (MODELO/PLACA)</Text>
      <View style={styles.row}>
      
        <TextInput
          placeholder="MODELO"
          style={[styles.inputFull, styles.nonEditable]} // Aplica o estilo especial diretamente
          value={modelo}
          editable={false} // Campo não editável
          onChangeText={(value) => setModelo(value.toUpperCase())} // Convertendo para maiúsculas
        />
        
        <TextInput
          placeholder="Placa do Veículo"
          style={[styles.inputFull, styles.nonEditable]} // Aplica o estilo especial diretamente
          value={placa}
          editable={false} // Campo não editável
          onChangeText={(value) => setPlaca(value.toUpperCase())} // Convertendo para maiúsculas
        />
      </View>

      {/* Seção de Peças */}
      <TouchableOpacity onPress={() => toggleSection('pecas')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PEÇAS</Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandedSection !== 'pecas'}>
        <View style={styles.sectionContent}>
          {pecas.map((peca, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                placeholder="Nome da Peça"
                style={styles.input}
                value={peca.nomePeca}
                onChangeText={(value) => handlePecaChange(index, 'nomePeca', value)} // Convertendo para maiúsculas
              />
              <TextInput
                placeholder="Qtd"
                style={styles.smallInput2}
                keyboardType="numeric"
                value={peca.qtd}
                onChangeText={(value) => handlePecaChange(index, 'qtd', value)} // Convertendo para maiúsculas
              />
              <TextInput
                placeholder="Un"
                style={styles.smallInput}
                keyboardType="numeric"
                value={peca.un}
                onChangeText={(value) =>{
                  const formattedValue = formatCurrency(value);
                  handlePecaChange(index, 'un', formattedValue);
                }}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarPeca}>
            <Text style={styles.addButtonText}>+ Adicionar Peça</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Seção de Serviços */}
      <TouchableOpacity onPress={() => toggleSection('servicos')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SERVIÇOS</Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandedSection !== 'servicos'}>
        <View style={styles.sectionContent}>
          {servicos.map((servico, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                placeholder="Serviço"
                style={styles.input}
                value={servico.servico}
                onChangeText={(value) => handleServicoChange(index, 'servico', value)} // Convertendo para maiúsculas
              />
              <TextInput
                placeholder="Qtd"
                style={styles.smallInput2}
                keyboardType="numeric"
                value={servico.qtd}
                onChangeText={(value) => handleServicoChange(index, 'qtd', value)} // Convertendo para maiúsculas
              />
              <TextInput
               placeholder="Un"
               style={styles.smallInput}
               keyboardType="numeric"
              value={servico.un}
              onChangeText={(value) => {
              const formattedValue = formatCurrency(value);
             handleServicoChange(index, 'un', formattedValue);
  }}
/>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarServico}>
            <Text style={styles.addButtonText}>+ Adicionar Serviço</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Seção de Observações */}
      <TouchableOpacity onPress={() => toggleSection('observacao')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>OBSERVAÇÃO</Text>
      </TouchableOpacity>
      <Collapsible collapsed={expandedSection !== 'observacao'}>
        <View style={styles.sectionContent}>
          {Array.isArray(observacao) &&
            observacao.map((obs, index) => (
              <View key={index} style={styles.row}>
                <TextInput
                  placeholder="Observação"
                  style={[styles.inputFull, styles.textArea]}
                  value={obs.obs}
                  onChangeText={(value) => handleObservacaoChange(index, 'obs', value)} // Convertendo para maiúsculas
                  multiline={true}
                />
              </View>
            ))}
          <TouchableOpacity style={styles.addButton} onPress={adicionarObservacao}>
            <Text style={styles.addButtonText}>+ Adicionar Observação</Text>
          </TouchableOpacity>
        </View>
      </Collapsible>

      {/* Seção para alterar a situação */}
      <View style={styles.row}>
        <Text style={styles.label}>Situação:</Text>
        <TouchableOpacity onPress={() => setSituacao(situacao === 'ABERTO' ? 'FECHADO' : 'ABERTO')} style={styles.buttonSituacao}>
          <Text style={styles.situacaoText}>{situacao}</Text>
        </TouchableOpacity>
      </View>
            
      {/* Botão estilizado */}
      <TouchableOpacity style={styles.button2} onPress={salvarOrcamento}>
        <Text style={styles.buttonText}>{orcamento ? "Salvar Orçamento" : "Criar Orçamento"}</Text>
      </TouchableOpacity>
       {/* Seção TOTAL */}
       <View style={styles.totalContainer}>
        <Text style={styles.totalText}>TOTAL: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </View>
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
    fontWeight: 'bold',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  smallInput: {
    width: 75,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 1,
    borderRadius: 5,
    textAlign: 'right'
  },
  smallInput2: {
    width: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  sectionHeader: {
    padding: 10,
    backgroundColor: '#D9D9F3',
    borderRadius: 5,
    marginBottom: 5,
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
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
  },
  buttonSituacao: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#7FFF00',
  },
  situacaoText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  nonEditable: {
    backgroundColor: '#E0FFFF', // Cor de fundo clara para melhorar a legibilidade
    borderColor: 'black', // Cor da borda mais clara
    color: '#000', // Mantém o texto na cor preta para melhor leitura
  },
  buttonText2: {
    color: 'blue', // Cor do texto
    fontSize: 16, // Tamanho da fonte
    
  },
  button2: {
    backgroundColor: '#FA8072', // Cor de fundo do botão
    padding: 15, // Espaçamento interno
    borderRadius: 50, // Bordas arredondadas
    alignItems: 'center', // Centraliza o texto
    marginTop: 20, // Margem acima
    marginLeft: 50,
    position: 'absolute', // Para posicionamento absoluto
    bottom: 80, // Distância do fundo da tela
    right: 20, // Distância da direita da tela
  },
  buttonText: {
    color: 'black', // Cor do texto
    fontSize: 16, // Tamanho da fonte
    fontWeight: 'bold', // Peso da fonte
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
});
