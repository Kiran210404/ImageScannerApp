import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find((d) => d.position === 'back');
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      const microphonePermission = await Camera.getMicrophonePermissionStatus();

      if (cameraPermission === 'granted' && microphonePermission === 'granted') {
        setHasPermission(true);
      } else {
        const newCameraPermission = await Camera.requestCameraPermission();
        const newMicrophonePermission = await Camera.requestMicrophonePermission();

        if (newCameraPermission === 'granted' && newMicrophonePermission === 'granted') {
          setHasPermission(true);
        } else {
          Alert.alert('Permissions Required', 'Camera and microphone access is needed.');
        }
      }
    })();
  },[]);

  if (!device) {return <View style={styles.centered}><Text>No Camera Available</Text></View>;}
  if (!hasPermission) {return <View style={styles.centered}><Text>Camera permission required</Text></View>;}

  const takePhoto = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera is not ready.');
      return;
    }
    try {
      const capturedPhoto = await cameraRef.current.takePhoto();
      setPhoto(`file://${capturedPhoto.path}`);
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

export default CameraScreen;
