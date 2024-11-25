import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Firestore
import { auth } from "../config/firebase"; // Configuración de Firebase

export default function FeedScreen() {
  const [posts, setPosts] = useState([]); // Estado para almacenar los posts
  const [loading, setLoading] = useState(true); // Estado de carga

  const db = getFirestore(); // Inicializa Firestore

  // Función para cargar las publicaciones
  const loadPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = [];

      querySnapshot.forEach((doc) => {
        postsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPosts(postsData); // Almacena las publicaciones en el estado
      setLoading(false); // Termina la carga
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudieron cargar las publicaciones.");
    }
  };

  useEffect(() => {
    loadPosts(); // Cargar las publicaciones cuando se monte el componente
  }, []);

  // Función para renderizar cada post
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.postText}>{item.description}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp?.toDate()).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loading}>Cargando publicaciones...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loading: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
  postContainer: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
});
