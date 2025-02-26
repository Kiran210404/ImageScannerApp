import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'back');

  const isFocused = useIsFocused();

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'granted') {
        setHasPermission(true);
      } else {
        Alert.alert('Camera Permission', 'Camera access is required.');
      }
    })();
  }, []);

  if (!device) {
    return <View style={styles.centered}><Text>No Camera Available</Text></View>;
  }
  if (!hasPermission) {
    return <View style={styles.centered}><Text>Camera permission required</Text></View>;
  }

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const capturedPhoto = await cameraRef.current.takePhoto(); // Renamed variable
        setPhoto(`file://${capturedPhoto.path}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image.');
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />
      )}

      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>

      {photo && <Image source={{ uri: photo }} style={styles.preview} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '75%' },
  captureButton: { backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 },
  captureText: { color: 'white', fontSize: 18 },
  preview: { width: 200, height: 200, marginTop: 10 },
});

export default App;
