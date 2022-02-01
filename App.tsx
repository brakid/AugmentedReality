import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View, Text } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { AmbientLight, BoxBufferGeometry, Fog, GridHelper, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { calculateAngle, calculateDirection, getCanvas, getDirection, smooth } from './utils';
import { LocationObject } from 'expo-location';
import { ThreeAxisMeasurement, Magnetometer } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

const App = () => {
  const { width, height } = useWindowDimensions();
  const [ location, setLocation ] = useState<LocationObject>();
  const [ subscription, setSubscription ] = useState<Subscription>();
  const [ data, setData ] = useState<ThreeAxisMeasurement>({ x: 0, y: 0, z: 0 });
  const cameraRef = useRef<PerspectiveCamera>();
  const sceneRef = useRef<Scene>();

  const subscribe = async () => {
    const available = await Magnetometer.isAvailableAsync();
    if (available) {
      let { status } = await Magnetometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access magnetometer was denied');
        return;
      }
      Magnetometer.setUpdateInterval(200);
      const subscription = Magnetometer.addListener(data => appendData(data))
      setSubscription(subscription);
      console.log('Magnetometer available');
    } else {
      console.log('Magnetometer not available');
    }
  };

  const appendData = (newData: ThreeAxisMeasurement): void => {
    setData(data => { return { x: smooth(data.x, newData.x), y: smooth(data.y, newData.y), z: smooth(data.z, newData.z) }});
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(undefined);
  };

  const initLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    setLocation(await Location.getCurrentPositionAsync({}));
  };

  const initCamera = async () => {
    let { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access camera was denied');
      return;
    }
  };

  useEffect(() => {
    initLocation();
    initCamera();
    subscribe();

    return () => unsubscribe();
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x000000;
  
    // Create a WebGLRenderer without a DOM element
    const renderer = new WebGLRenderer({ context: gl, canvas: getCanvas(gl), alpha: true });
    renderer.setClearColor(sceneColor, 0);
  
    const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;
  
    const scene = new Scene();
    scene.fog = new Fog(sceneColor, 1, 10000);
    scene.add(new GridHelper(10, 10));

    sceneRef.current = scene;
  
    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);
  
    const cube = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color: 0xff0000 }));
    cube.position.set(10, 0, 0);
    scene.add(cube);
  
    camera.lookAt(cube.position);
  
    // Setup an animation loop
    const render = () => {
      console.log(camera.rotation);
      const timeout = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  if (cameraRef.current) {
    cameraRef.current.rotation.y = getDirection(calculateAngle(data.y, data.z));
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Camera type={ Camera.Constants.Type.back } style={{ width, height }}>
        <Text>direction (phone in horizontal mode): { calculateDirection(calculateAngle(data.y, data.z)) }</Text>
        <GLView style={{ width, height }} onContextCreate={ onContextCreate } />
      </Camera>
    </View>
  );
}

export default App;