import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Image } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import ViewShot, { captureRef } from 'react-native-view-shot';


const RelatorioOrcamento = ({ route }) => {
  const { orcamento } = route.params;
  const viewRef = useRef();

  const formatarData = (data) => {
    const dataCriacao = new Date(data);
    const dia = String(dataCriacao.getDate()).padStart(2, '0');
    const mes = String(dataCriacao.getMonth() + 1).padStart(2, '0');
    const ano = dataCriacao.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const gerarPDF = async (uri) => {
    let htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0; /* Remover margens */
              padding: 0; /* Remover padding */
              font-size: 12px;
              height: auto; /* Permitir ajuste automático da altura */
              page-break-inside: avoid; /* Evitar quebra de página dentro do corpo */
            }
            h1 {
              font-size: 24px;
              text-align: center;
              page-break-after: avoid; /* Evitar quebra após o título */
            }
            .image {
              text-align: center;
              margin: 0; /* Remover margens da imagem */
            }
            .tableHeader, .tableRow {
              display: flex; /* Usar flex para controlar a tabela */
              justify-content: space-between; /* Distribuir espaço entre colunas */
              width: 100%; /* Certifique-se de que as linhas ocupam 100% */
              page-break-inside: avoid; /* Evitar quebra dentro da tabela */
            }
            .tableColHeader, .tableCol {
              flex: 1; /* Tabela com colunas de mesmo tamanho */
              padding: 5px; /* Adicionar espaçamento interno */
            }
            .tableColHeaderRight, .tableColRight {
              text-align: right; /* Alinhamento à direita */
            }
            .subtitulo {
              text-align: center;
              margin: 0; /* Remover margens reduzidas */
            }
          </style>
        </head>
        <body>
          <h1>ORÇAMENTO</h1>
          <div class="image">
            <img src="${uri}" style="max-width: 100%; height: auto;" />
          </div>
          <!-- Restante do conteúdo -->
        </body>
      </html>
    `;

    let options = {
      html: htmlContent,
      fileName: 'relatorio_orcamento',
      directory: 'Documents',
    };

    try {
      let file = await RNHTMLtoPDF.convert(options);
      console.log(file.filePath);

      // Compartilhar PDF via WhatsApp
      await Share.open({
        title: 'Compartilhar Orçamento',
        url: `file://${file.filePath}`,
        type: 'application/pdf',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const captureAndShareScreenshot = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1, // Aumentar a qualidade
        width: 800, // Definir uma largura fixa
        height: orcamento.pecas.length * 50 + 1200, // Ajuste dinâmico
      });

      await Share.open({
        
        url: uri,
        type: 'image/png',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ViewShot ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={require('../image/logo.png')} style={styles.logo} />
          </View>
          <Text style= {styles.cliente}>DATA: {formatarData(orcamento.dataCriacao)}</Text>
          <Text style={styles.cliente}>CLIENTE: {orcamento.nome}</Text>
          <Text style={styles.cliente}>ENDEREÇO: {orcamento.endereco}</Text>
          <Text style={styles.cliente}>NUMERO: {orcamento.numero}</Text>
          <Text style={styles.cliente}>MODELO: {orcamento.modelo}</Text>
          <Text style={styles.cliente}>PLACA: {orcamento.placa}</Text>

          <Text style={styles.subtitulo}>=========================================</Text>
          <Text style={styles.subtitulo2}>ORÇAMENTO</Text>
          
          {/* Tabela de Peças */}
          <Text style={styles.secao}>PEÇAS</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableColHeader}>Nome</Text>
            <Text style={styles.tableColHeaderRight}>Qtd</Text>
            <Text style={styles.tableColHeaderRight}>Unidade</Text>
          </View>
          {orcamento.pecas.map((peca, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{peca.nomePeca}</Text>
              <Text style={styles.tableColRight}>{peca.qtd}</Text>
              <Text style={styles.tableColRight}>{peca.un}</Text>
            </View>
          ))}

          <Text style={styles.subtitulo}>=========================================</Text>
          
          {/* Tabela de Serviços */}
          <Text style={styles.secao}>SERVIÇOS</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableColHeader}>Serviço</Text>
            <Text style={styles.tableColHeaderRight}>Qtd</Text>
            <Text style={styles.tableColHeaderRight}>Unidade</Text>
          </View>
          {orcamento.servicos.map((servico, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{servico.servico}</Text>
              <Text style={styles.tableColRight}>{servico.qtd}</Text>
              <Text style={styles.tableColRight}>{servico.un}</Text>
            </View>
          ))}

          <Text style={styles.subtitulo}>=========================================</Text>
          
          <Text style={styles.total}>
           TOTAL: {orcamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </ViewShot>

      {/* Botão para gerar e compartilhar PDF (fora da captura) */}
      <Button title="Compartilhar Screenshot" onPress={captureAndShareScreenshot} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cliente:{
    fontSize: 16,
    
    color:'#000'

  },
  
  logo: {
    width: 350, // Ajuste conforme necessário
    height: 180, // Ajuste conforme necessário
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    textAlign: 'center',
    marginVertical: 5,
  },
  subtitulo2: {
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 24,
    fontWeight: 'bold',
    color:'#000',
  },
  secao: {
    fontWeight: 'bold',
    color:'#000',
    marginTop: 10,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'#000',
    marginTop: 10,
    textAlign: 'right',
  },
  tableHeader: {
    
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  tableColHeader: {
    flex: 3, // Ocupa mais espaço
    fontWeight: 'bold',
    color:'#DC143C',
  },
  tableColHeaderRight: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'right',
    color:'#DC143C',
  },
  tableCol: {
    flex: 3, // Ocupa mais espaço
    color:'#000',
  },
  tableColRight: {
    flex: 1,
    textAlign: 'right',
    color:'#000',
  },
});

export default RelatorioOrcamento;
