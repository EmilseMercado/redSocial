import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../config/firebase";
import { updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "");
  const [profileImage, setProfileImage] = useState(auth.currentUser?.photoURL || null);
  const [currentDisplayName, setCurrentDisplayName] = useState(displayName);
  const [currentProfileImage, setCurrentProfileImage] = useState(profileImage);
  const [uploading, setUploading] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const db = getFirestore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);

      const currentUser = auth.currentUser;
      const updates = {};

      if (displayName && displayName !== currentUser.displayName) {
        updates.displayName = displayName;
      }

      if (profileImage && profileImage !== currentUser.photoURL) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        updates.photoURL = downloadURL;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(currentUser, updates);

        setCurrentDisplayName(updates.displayName || currentUser.displayName);
        setCurrentProfileImage(updates.photoURL || currentUser.photoURL);

        Alert.alert("Perfil actualizado", "Tu perfil ha sido actualizado con éxito.");
      } else {
        Alert.alert("Sin cambios", "No hay cambios para actualizar.");
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Alert.alert("Error", "Hubo un problema al actualizar tu perfil.");
    } finally {
      setUploading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) {
        console.error("No se encontró un usuario autenticado.");
        return;
      }

      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userUid)
      );

      const querySnapshot = await getDocs(postsQuery);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserPosts(posts);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
      <View style={styles.imageContainer}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Text style={styles.label}>Correo electrónico</Text>
      <Text style={styles.email}>{auth.currentUser?.email}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={uploading}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="pencil" size={20} color="#1A1A1D" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{uploading ? "Cargando..." : "Actualizar Perfil"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => alert("Configuración seleccionada")}>
              <Text style={styles.modalOption}>Configuración</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert("Privacidad seleccionada")}>
              <Text style={styles.modalOption}>Privacidad</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert("Cambio de contraseña seleccionado")}>
              <Text style={styles.modalOption}>Cambio de contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#d8006f" style={styles.closeModal} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={[styles.titlePost, { marginTop: 30 }]}>Mis Publicaciones</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Cargando tus publicaciones...</Text>
        </View>
      ) : userPosts.length > 0 ? (
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Image source={{ uri: currentProfileImage }} style={styles.userImage} />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{currentDisplayName || "Usuario"}</Text>
                  <Text style={styles.postDate}>
                    Publicado el {new Date(item.timestamp.seconds * 1000).toLocaleDateString()} a las{" "}
                    {new Date(item.timestamp.seconds * 1000).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.postDescription}>{item.description}</Text>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noPosts}>No tienes publicaciones aún.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1A1A2E",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFD700",
    marginTop: 30,
  },
  titlePost: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#FFD700",
  },
  imageContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 25,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#ddd",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#FFD700",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginHorizontal: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "#1A1A1D",
  },
  settingsButton: {
    backgroundColor: "#d8006f",
    borderRadius: 30,
    padding: 10,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    color: "#333",
  },
  closeModal: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#2D2D3B",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFD700",
  },
  postDate: {
    fontSize: 12,
    color: "#ccc",
  },
  postDescription: {
    fontSize: 14,
    color: "#fff",
    marginVertical: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  noPosts: {
    fontSize: 16,
    textAlign: "center",
    color: "#fff",
  },
});
