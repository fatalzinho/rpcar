import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 

const CadastroScreen = ({ navigation, route }) => {
  const clienteExistente = route.params?.cliente || null; // Recebe o cliente se houver (edição)

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [placa, setPlaca] = useState(''); // Mantém em branco para novo carro
  const [tipo, setTipo] = useState('');   // Mantém em branco para novo carro
  const [modelo, setModelo] = useState(''); // Mantém em branco para novo carro
  const [ano, setAno] = useState('');     // Mantém em branco para novo carro
  const [adicionarCarro, setAdicionarCarro] = useState(false);

  
  // Se for edição, preenche os campos com os dados do cliente
  useEffect(() => {
    if (clienteExistente) {
      setNome(clienteExistente.nome);
      setEndereco(clienteExistente.endereco);
      setNumero(clienteExistente.numero);
      setComplemento(clienteExistente.complemento);
      setBairro(clienteExistente.bairro);
      setCep(clienteExistente.cep);
      setCpf(clienteExistente.cpf);
      setTelefone(clienteExistente.telefone);
    }
  }, [clienteExistente]);

  // Função para formatar o CEP
  const formatCep = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  // Função para buscar o endereço via CEP (sem hífen)
  const handleCepChange = async (value) => {
    const rawCep = value.replace(/\D/g, '');
    setCep(formatCep(value));

    if (rawCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(data.logradouro.toUpperCase());
          setBairro(data.bairro.toUpperCase());
        } else {
          setEndereco('');
          alert('CEP não encontrado.');
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao buscar o CEP.');
      }
    } else {
      setEndereco('');
      setBairro('');
    }
  };

  // Função para salvar ou atualizar o cliente no Firestore
  const salvarCliente = async (cliente) => {
    try {
      const clienteRef = await firestore().collection('clientes').add(cliente);
      return clienteRef.id; // Retorna o ID do cliente para uso futuro
    } catch (error) {
      console.error("Erro ao salvar cliente: ", error);
    }
  };
  
  // Função para salvar o carro no Firestore
  const salvarCarro = async (carro, clienteId) => {
    try {
      const carroData = { ...carro, clienteId }; // Vincula o carro ao cliente
      await firestore().collection('carros').add(carroData);
    } catch (error) {
      console.error("Erro ao salvar carro: ", error);
    }
  };
  
  // Função para enviar os dados
  const handleSubmit = async () => {
    const cliente = {
      nome: nome.toUpperCase(),
      endereco: endereco.toUpperCase(),
      numero,
      complemento: complemento.toUpperCase(),
      bairro: bairro.toUpperCase(),
      cep: cep.replace(/\D/g, ''),  // Remove a formatação
      telefone: telefone.replace(/\D/g, ''),  // Remove a formatação
      cpf,
    };
  
    // Dados do carro
    const carro = {
      placa: placa.toUpperCase(),
      marca: tipo.toUpperCase(),
      modelo: modelo.toUpperCase(),
      ano,
    };
  
    try {
      let clienteId;
      if (clienteExistente) {
        // Edição: Atualiza o cliente existente
        clienteId = clienteExistente.id;
        await firestore().collection('clientes').doc(clienteId).update(cliente);
        alert('Cliente atualizado com sucesso!');
      } else {
        // Novo cadastro: Cria um novo cliente
        clienteId = await salvarCliente(cliente);
        alert('Cliente cadastrado com sucesso!');
      }
  
      // Salva o carro com o ID do cliente
      if (adicionarCarro) {
        await salvarCarro(carro, clienteId);
        alert('Carro adicionado com sucesso!');
      }
  
      // Resetar os campos após envio
      setNome('');
      setEndereco('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCep('');
      setCpf('');
      setTelefone('');
      setPlaca('');
      setTipo('');
      setModelo('');
      setAno('');
  
      navigation.goBack();  // Volta para a tela anterior
    } catch (error) {
      console.error("Erro ao salvar cliente ou carro: ", error);
      alert("Erro ao salvar. Tente novamente.");
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.buttonText2}>NOME</Text>
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={(text) => setNome(text.toUpperCase())}
        style={styles.input}
      />
      <Text style={styles.buttonText2}>CEP</Text>
      <TextInput
        placeholder="CEP"
        value={cep}
        onChangeText={handleCepChange}  // Altera para a nova função
        style={styles.input2}
        keyboardType="numeric"
      />
      <Text style={styles.buttonText2}>ENDERECO</Text>
      <TextInput
        placeholder="Endereço"
        value={endereco}
        onChangeText={(text) => setEndereco(text.toUpperCase())}
        style={styles.addressInput}
      />
      <Text style={styles.buttonText2}>NUMERO</Text>
      <TextInput
        placeholder="Número"
        value={numero}
        onChangeText={setNumero}
        style={styles.numberInput}
        keyboardType="numeric"
      />
      <Text style={styles.buttonText2}>COMPLEMENTO</Text>
      <TextInput
        placeholder="Complemento"
        value={complemento}
        onChangeText={(text) => setComplemento(text.toUpperCase())}
        style={styles.input}
      />
      <Text style={styles.buttonText2}>BAIRRO</Text>
      <TextInput
        placeholder="Bairro"
        value={bairro}
        onChangeText={(text) => setBairro(text.toUpperCase())}
        style={styles.input}
      />
      <Text style={styles.buttonText2}>CPF</Text>
      <TextInput
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        style={styles.input2}
        keyboardType="numeric"
      />
      <Text style={styles.buttonText2}>TELEFONE</Text>
      <TextInput
        placeholder="Telefone"
        value={telefone}
        onChangeText={(value) => setTelefone(value)}
        style={styles.input2}
        keyboardType="numeric"
      />

      <TouchableOpacity onPress={() => setAdicionarCarro(!adicionarCarro)}>
        <MaterialIcons name="car-rental" size={50} color="blue" />
      </TouchableOpacity>

      {adicionarCarro && (
        <View style={styles.carContainer}>
          <Text style={styles.buttonText}>CADASTRAR CARRO</Text>
          <Text style={styles.buttonText2}>PLACA</Text>
          <TextInput
            placeholder="Placa"
            value={placa}
            onChangeText={(text) => setPlaca(text.toUpperCase())}
            style={styles.input2}
          />
          <Text style={styles.buttonText2}>MARCA</Text>
          <TextInput
            placeholder="Marca"
            value={tipo}
            onChangeText={(text) => setTipo(text.toUpperCase())}
            style={styles.input2}
          />
          <Text style={styles.buttonText2}>MODELO</Text>
          <TextInput
            placeholder="Modelo"
            value={modelo}
            onChangeText={(text) => setModelo(text.toUpperCase())}
            style={styles.input2}
          />
          <Text style={styles.buttonText2}>ANO</Text>
          <TextInput
            placeholder="Ano"
            value={ano}
            onChangeText={setAno}
            style={styles.input2}
          />
        </View>
      )}

      <TouchableOpacity style={styles.button2} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{clienteExistente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#527F76',
    flexGrow: 1,
    padding: 20,
    justifyContent: 'top',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderColor: 'black',
    backgroundColor: '#E0FFFF',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input2: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    marginRight: 120,
    borderColor: 'black',
    backgroundColor: '#E0FFFF',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#E0FFFF',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    width: '30%',
    borderColor: 'black',
    backgroundColor: '#E0FFFF',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    borderColor: 'black',
    backgroundColor: '#E0FFFF',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  carContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF', // Cor de fundo do botão
    padding: 15, // Espaçamento interno
    borderRadius: 5, // Bordas arredondadas
    alignItems: 'center', // Centraliza o texto
    marginTop: 20, // Margem acima
    marginRight: 10,
  },
  button2: {
    backgroundColor: 'orange', // Cor de fundo do botão
    padding: 15, // Espaçamento interno
    borderRadius: 50, // Bordas arredondadas
    alignItems: 'center', // Centraliza o texto
    marginTop: 20, // Margem acima
    marginLeft: 100,
    position: 'absolute', // Para posicionamento absoluto
    bottom: 20, // Distância do fundo da tela
    right: 20, // Distância da direita da tela
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold', // Cor do texto
    fontSize: 16, // Tamanho da fonte
     // Peso da fonte
  },
  buttonText2: {
    color: 'blue', // Cor do texto
    fontSize: 12, // Tamanho da fonte
    
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    
  },
});

export default CadastroScreen;
