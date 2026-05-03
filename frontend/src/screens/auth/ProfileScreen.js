import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_STORE_URL = "https://onako-bigmart-mobile-app-production.up.railway.app";

export default function ProfileScreen({ navigation }) {
    const { user, token, updateProfileContext, logout } = useContext(AuthContext);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState(user?.profileImage ? `${API_STORE_URL}${user.profileImage}` : null);
    const [imageFile, setImageFile] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            setImageFile(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            
            if (imageFile) {
                const localUri = imageFile.uri;
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('profileImage', {
                    uri: localUri,
                    name: filename,
                    type
                });
            }

            const { data } = await axios.put(`${API_STORE_URL}/api/auth/profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            updateProfileContext(data);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Profile</Text>
            
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Select Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />

            <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate}>
                <Text style={styles.btnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLogout} onPress={logout}>
                <Text style={styles.btnText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    imageContainer: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', backgroundColor: '#e1e1e1', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { color: '#888' },
    input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    btnUpdate: { width: '100%', backgroundColor: 'orange', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    btnLogout: { width: '100%', backgroundColor: 'red', padding: 15, borderRadius: 5, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold' }
});
