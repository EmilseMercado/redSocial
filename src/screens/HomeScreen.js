import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, StyleSheet, FlatList } from "react-native";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);  // Estado para almacenar las publicaciones

  // Cargar publicaciones desde Firestore
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postQuerySnapshot = await getDocs(collection(db, "posts"));
        const postList = postQuerySnapshot.docs.map((doc) => doc.data());
        setPosts(postList);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    loadPosts();
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.replace("Login"))
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Icono de cerrar sesión */}
      <Ionicons
        name="log-out-outline"
        size={40}
        color="#FFD700"
        style={styles.logoutIcon}
        onPress={handleLogout}
      />

      {/* Header con información del usuario autenticado */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: auth.currentUser?.photoURL }}
          style={styles.userProfileImage}
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{auth.currentUser?.displayName}</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
        </View>
      </View>

      {/* Lista de publicaciones */}
      <Text style={styles.sectionTitle}>Últimas publicaciones</Text>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            )}
            <Text style={styles.postDescription}>{item.description}</Text>
            <Text style={styles.postUser}>Publicado por: {item.userName}</Text>
          </View>
        )}
        keyExtractor={(item) => item.timestamp.toString()}
        contentContainerStyle={styles.postsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E", // Fondo principal oscuro
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  logoutIcon: {
    position: "absolute",
    top: 65,
    right: 20,
    zIndex: 1,
    color: "#FFD700",
  },
  userInfo: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#162447",
    alignItems: "center",
    marginBottom: 20,
  },
  userProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00A8CC",
    fontFamily: "Roboto",
  },
  email: {
    fontSize: 14,
    color: "#E5E5E5",
    fontFamily: "Roboto",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#FFD700",
    fontFamily: "Roboto",
  },
  postsList: {
    paddingBottom: 20,
  },
  postCard: {
    marginBottom: 20,
    backgroundColor: "#162447",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postDescription: {
    fontSize: 16,
    color: "#FFD700",
    marginBottom: 5,
    fontFamily: "Roboto",
  },
  postUser: {
    fontSize: 14,
    color: "#E5E5E5",
    fontFamily: "Roboto",
  },
});
