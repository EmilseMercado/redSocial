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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; // Icono de flecha hacia atrás

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert("error", "por favor, completa todos los campos.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Actualiza el perfil del usuario con el nombre
        updateProfile(user, { displayName: name })
          .then(() => {
            Alert.alert("registro exitoso", "¡bienvenido a RedSocial!");
            navigation.replace("Home");
          })
          .catch(() => {
            Alert.alert("error", "ocurrió un problema al guardar tu perfil.");
          });
      })
      .catch((error) => {
        // Manejo detallado de errores de Firebase
        let errorMessage = "no se pudo completar el registro.";
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "el correo ya está registrado. usa otro.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "el correo electrónico no es válido.";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "la contraseña debe tener al menos 6 caracteres.";
        }
        Alert.alert("error", errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      {/* Icono de flecha hacia atrás */}
      

      <Text style={styles.title}>Registro</Text>
      <TextInput
        placeholder="nombre completo"
        placeholderTextColor="#b3b3b3"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="correo electrónico"
        placeholderTextColor="#b3b3b3"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="contraseña"
        placeholderTextColor="#b3b3b3"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>
          ¿ya tienes una cuenta? inicia sesión
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
    backgroundColor: "#1A1A1D", // Fondo oscuro elegante
  },
  backIcon: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700", // Tono dorado para el título
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFD700", // Borde dorado
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#333333", // Fondo oscuro para los campos de entrada
    color: "#ffffff", // Texto claro para un buen contraste
  },
  button: {
    backgroundColor: "#FFD700", // Botón dorado
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#1A1A1D", // Texto oscuro para contrastar con el botón
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "lowercase",
  },
  loginLink: {
    color: "#FFD700", // Enlace dorado
    marginTop: 20,
    fontSize: 14,
    textTransform: "lowercase",
  },
});
