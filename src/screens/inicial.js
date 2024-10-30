import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from './AberturaApp'; // Adicione o SplashScreen
import CadatroScreen from './Cadastro';
import OrcamentoScreen from './Orcamento';
import ClienteScreen from './Cliente';
import PesquisaScreen from './pesquisa';
import AbertoScreen from './aberto';
import EditarOrcamentoScreen from './EditarOrcamentoScreen';
import RelatorioOrcamento from './relatorioOrcamento';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Mapeamento das rotas do Drawer
const DrawerRoutes = () => (
  <Drawer.Navigator initialRouteName="Splash">

    <Drawer.Screen
      name="Orcamento"
      component={OrcamentoScreen}
      options={{
        drawerIcon: ({ size, color }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Pesquisa"
      component={PesquisaScreen}
      options={{
        drawerIcon: ({ size, color }) => (
          <MaterialIcons name="search" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Cadastro"
      component={CadatroScreen}
      options={{
        drawerIcon: ({ size, color }) => (
          <MaterialIcons name="add" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Cliente"
      component={ClienteScreen}
      options={{
        drawerIcon: ({ size, color }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ),
      }}
    />
    
  </Drawer.Navigator>
);

// Navegação principal com Stack
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }} // Esconde o cabeçalho
        />
        {/* Definindo as telas principais do Drawer */}
        <Stack.Screen
          name="Drawer"
          component={DrawerRoutes}
          options={{ headerShown: false }}
        />
        {/* Adicionando a tela de EditarOrcamento ao Stack */}
        <Stack.Screen
          name="RelatorioOrcamento"
          component={RelatorioOrcamento}
          options={{ title: 'Relatorio' }}
        />
        <Stack.Screen
          name="EditarOrcamento"
          component={EditarOrcamentoScreen}
          options={{ title: 'Orçamento' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
