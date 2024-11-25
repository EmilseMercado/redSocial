import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.replace("Home"); // Redirige a la pantalla de inicio
      })
      .catch((error) => {
        Alert.alert("Error", "Credenciales incorrectas o problemas de conexión.");
      });
  };

  return (
    <View style={styles.container}>
      {/* Encabezado estilizado */}
      <Text style={styles.headerText}>CLAnDEstRy</Text>

      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#b3b3b3" // Texto de marcador claro para contraste
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#b3b3b3" // Texto de marcador claro para contraste
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>
          ¿No tienes una cuenta? Regístrate aquí
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1A1A1D", // Fondo oscuro con un tono elegante
  },
  headerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFD700", // Dorado brillante para destacar el nombre
    textTransform: "none", // Respeta mayúsculas y minúsculas (NO convierte a mayúsculas)
    letterSpacing: 4, // Espaciado entre letras
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFD700", // Dorado más suave para el subtítulo
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFD700", // Bordes dorados
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#333333", // Fondo oscuro para los campos de entrada
    color: "#ffffff", // Texto blanco para un buen contraste
  },
  button: {
    backgroundColor: "#FFD700", // Botón dorado brillante
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#1A1A1D", // Texto oscuro para buen contraste en el botón
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLink: {
    color: "#FFD700", // Enlace dorado para registro
    marginTop: 20,
    fontSize: 14,
  },
});
