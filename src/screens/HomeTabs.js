import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Importa las pantallas del Home
import HomeScreen from "./HomeScreen"; // Pantalla principal
import PostScreen from "./PostScreen"; // Pantalla de publicaciones
import EditProfileScreen from "./EditProfileScreen"; // Pantalla de edición de perfil

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Definir los iconos para cada pantalla
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Post") {
            iconName = focused ? "create" : "create-outline";
          } else if (route.name === "Edit Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          // Devuelve el ícono con los colores y tamaños correspondientes
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FFD700", // Dorado brillante para íconos activos
        tabBarInactiveTintColor: "#C0C0C0", // Plateado para íconos inactivos
        tabBarStyle: {
          backgroundColor: "#1C1C1E", // Fondo gris oscuro para la barra de navegación
          borderTopWidth: 0, // Eliminar borde superior
          height: 70, // Altura personalizada para la barra de pestañas
          paddingBottom: 10, // Espacio adicional para que los íconos no se vean apretados
          shadowColor: "#FFD700", // Sombra tenue dorada
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
        },
        headerShown: false, // Oculta la barra superior en las pestañas
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Edit Profile" component={EditProfileScreen} />
    </Tab.Navigator>
  );
}
