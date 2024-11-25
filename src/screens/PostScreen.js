import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, storage } from "../config/firebase";
import Icon from "react-native-vector-icons/FontAwesome";

export default function PostScreen() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const storageRef = ref(
        storage,
        `posts/${auth.currentUser.uid}_${Date.now()}`
      );
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen.");
      return null;
    }
  };

  const handlePost = async () => {
    if (!description.trim() && !image) {
      Alert.alert(
        "Error",
        "Por favor, escribe una descripción o selecciona una imagen."
      );
      return;
    }

    try {
      setPosting(true);
      const imageUrl = await uploadImage();

      await addDoc(collection(db, "posts"), {
        description,
        imageUrl,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        timestamp: new Date(),
      });

      Alert.alert("¡Éxito!", "Tu publicación se ha guardado.");
      setDescription("");
      setImage(null);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Escribe un comentario.");
      return;
    }

    try {
      await addDoc(collection(db, "posts", selectedPostId, "comments"), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        comment,
        timestamp: new Date(),
      });

      setComment("");
      setSelectedPostId(null);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        comments: [],
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const loadComments = (postId) => {
    setSelectedPostId(postId);

    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: snapshot.docs.map((doc) => doc.data()) }
            : post
        )
      );
    });

    return unsubscribe;
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      <Text style={styles.postDescription}>{item.description}</Text>
      <Text style={styles.postUserName}>Publicado por: {item.userName}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => loadComments(item.id)}
          style={styles.iconButton}
        >
          <Icon name="comment" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="heart" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="share" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {item.id === selectedPostId && (
        <>
          <FlatList
            data={item.comments}
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <Text style={styles.commentUser}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Escribe un comentario..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={handleComment}
            >
              <Text style={styles.buttonText}>Comentar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
            <Text style={styles.title}>CLAnDEstRy</Text>
      <Text style={styles.title}>¡Aquí puedes postear algo nuevo!</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Escribe una descripción..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Icon name="image" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePost}
          disabled={posting}
        >
          <Text style={styles.buttonText}>
            {posting ? "Publicando..." : "Publicar"}
          </Text>
        </TouchableOpacity>
      </View>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E", // Fondo principal
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700", // Títulos de secciones
    textAlign: "center", // Centra el texto
    marginBottom: 30, // Aumenta el margen inferior para separarlo más
    marginTop: 30, // Mueve el título un poco más abajo
  },
  
  input: {
    flex: 1,
    height: 50,
    borderColor: "#162447", // Línea de división sutil
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#333333", // Fondo oscuro para entradas
    color: "#E5E5E5", // Texto secundario
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  postContainer: {
    backgroundColor: "#162447", // Fondo de tarjetas de publicaciones
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#FFD700", // Sombra amarilla vibrante
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postDescription: {
    fontSize: 16,
    color: "#FFD700", // Descripción en amarillo
    marginBottom: 10,
  },
  postUserName: {
    fontSize: 14,
    color: "#00A8CC", // Nombre del usuario
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    gap: 15,
  },
  iconButton: {
    paddingHorizontal: 10,
  },
  publishButtonContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  publishButton: {
    backgroundColor: "#FFD700", // Botón principal en amarillo
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#1A1A2E", // Texto de botón en contraste con amarillo
    fontSize: 18,
    fontWeight: "bold",
  },
  commentButton: {
    backgroundColor: "#FFD700", // Botón de comentarios
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  commentContainer: {
    marginVertical: 10,
  },
  commentUser: {
    color: "#00A8CC", // Usuario en los comentarios
    fontWeight: "bold",
  },
  commentText: {
    color: "#E5E5E5", // Texto secundario
  },
  imageSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  imageButton: {
    padding: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  publishButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFD700", // Botón principal
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#1A1A2E", // Texto de botón en contraste con amarillo
    fontSize: 14,
    fontWeight: "bold",
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  commentButton: {
    backgroundColor: "#FFD700", // Botón de comentarios
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});


