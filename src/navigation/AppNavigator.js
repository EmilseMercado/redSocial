import React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import HomeTabs from "../screens/HomeTabs"; // Importa las pestañas de navegación del Home

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1A1A1D", // Fondo oscuro para los encabezados
        },
        headerTintColor: "#FFD700", // Color dorado para el texto de los encabezados
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
          letterSpacing: 1.5, // Espaciado elegante
        },
        cardStyle: {
          backgroundColor: "#1A1A1D", // Fondo oscuro para las pantallas
        },
        ...TransitionPresets.SlideFromRightIOS, // Transiciones suaves entre pantallas
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: "Bienvenido", // Personaliza el título del encabezado
          headerShown: false, // Oculta el header para esta pantalla
        }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          title: "Crear Cuenta", // Personaliza el título del encabezado
        }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeTabs} 
        options={{
          headerShown: false, // Oculta el header del Stack para Home
        }} 
      />
    </Stack.Navigator>
  );
}
