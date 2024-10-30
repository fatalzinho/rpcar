import React, { useEffect, useState } from 'react';
import {PermissionsAndroid, View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import * as Animatable from 'react-native-animatable';
import { Linking } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const [appVersion, setAppVersion] = useState(DeviceInfo.getVersion());
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const requestStoragePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permissão de Armazenamento',
            message: 'Este aplicativo precisa de permissão para acessar o armazenamento.',
            buttonNeutral: 'Pergunte-me depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão concedida');
        } else {
          console.log('Permissão negada');
        }
      } catch (err) {
        console.warn(err);
      }
    };
  
    requestStoragePermission();
  }, []);
  

  const checkAndCreateFolder = async () => {
    const downloadsPath = RNFS.DownloadDirectoryPath;
    const routesFolder = `${downloadsPath}/Rotas`;

    try {
      const folderExists = await RNFS.exists(routesFolder);
      if (!folderExists) {
        await RNFS.mkdir(routesFolder);
        console.log('Pasta "Rotas" criada com sucesso!');
      } else {
        console.log('A pasta "Rotas" já existe.');
      }
    } catch (error) {
      console.error('Erro ao verificar/criar a pasta:', error);
    }
  };

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const doc = await firestore()
          .collection('organizador')
          .doc('atualizacao')
          .get();

        const serverVersion = doc.get('versao');
        const apkUrl = doc.get('apkUrl');

        if (serverVersion > appVersion) {
          Alert.alert(
            'Atualização necessária',
            'Há uma nova versão disponível. O aplicativo será atualizado automaticamente.',
            [{ text: 'OK', onPress: () => downloadAndInstallAPK(apkUrl, serverVersion) }]
          );
        } else {
          const timer = setTimeout(() => {
            navigation.replace('Drawer');
          }, 2000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Erro ao verificar a versão do aplicativo:', error);
      }
    };

    checkVersion();
    checkAndCreateFolder();
  }, [navigation, appVersion]);

  const downloadAndInstallAPK = async (url, serverVersion) => {
    const apkPath = `${RNFS.DownloadDirectoryPath}/Rotas/MB-org${serverVersion}.apk`;

    try {
      // Verifica se o APK já existe
      const fileExists = await RNFS.exists(apkPath);

      if (fileExists) {
        setIsDownloading(false);
        setIsInstalling(true);
        installAPK(apkPath);
      } else {
        setIsDownloading(true);

        // Baixa o APK
        const download = RNFS.downloadFile({
          fromUrl: url,
          toFile: apkPath,
          progress: (res) => {
            const progress = Math.floor((res.bytesWritten / res.contentLength) * 100);
            setDownloadProgress(progress);
          },
        });

        const result = await download.promise;

        if (result.statusCode === 200) {
          setIsDownloading(false);
          setIsInstalling(true);
          installAPK(apkPath);
        } else {
          throw new Error('Erro ao baixar o APK');
        }
      }
    } catch (error) {
      setIsDownloading(false);
      console.error('Erro ao baixar o APK:', error);
    }
  };

  const installAPK = (apkPath) => {
    if (Platform.OS === 'android') {
      RNFetchBlob.android.actionViewIntent(apkPath, 'application/vnd.android.package-archive')
        .catch((err) => {
          console.error('Erro ao abrir o APK:', err);
        });
    } else {
      Linking.openURL(`file://${apkPath}`)
        .catch((err) => {
          console.error('Erro ao abrir o APK:', err);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={2000} style={styles.animatableContainer}>
        <Text style={styles.text}>© Michel Branco. Todos os direitos reservados.</Text>
        <Text style={styles.versionText}>Versão do App: {appVersion}</Text>
        {isDownloading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.statusText}>Baixando APK... {downloadProgress}%</Text>
          </View>
        )}
        {isInstalling && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.statusText}>Instalando APK...</Text>
          </View>
        )}
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C0C0C0',
  },
  animatableContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  versionText: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  overlay: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: 'black',
  },
});

export default SplashScreen;
