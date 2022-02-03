import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View, Text } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { AmbientLight, BoxBufferGeometry, Fog, GridHelper, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { getCanvas } from './utils';
import { LocationObject } from 'expo-location';
import { ThreeAxisMeasurement, Magnetometer, DeviceMotion } from 'expo-sensors';
import { Subscription } from 'expo-modules-core';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { getOrientation, getRotationMatrix, Orientation } from './rotation';
import { LowPassFilter } from './lowpassfilter';

const App = () => {
  const { width, height } = useWindowDimensions();
  const [ location, setLocation ] = useState<LocationObject>();
  const [ orientation, setOrientation ] = useState<Orientation>({ azimuth: 0, pitch: 0, roll: 0 });
  const [ magnetometerFilter ] = useState<LowPassFilter>(new LowPassFilter());
  const [ magnetometerData, setMagnetometerData ] = useState<ThreeAxisMeasurement>({ x: 0, y: 0, z: 0 });
  const [ magnetometerSubscription, setMagnetometerSubscription ] = useState<Subscription>();
  const [ accelerometerFilter ] = useState<LowPassFilter>(new LowPassFilter());
  const [ accelerometerData, setAccelerometerData ] = useState<ThreeAxisMeasurement>({ x: 0, y: 0, z: 0 });
  const [ accelerometerSubscription, setAccelerometerSubscription ] = useState<Subscription>();
  const cameraRef = useRef<PerspectiveCamera>();
  const sceneRef = useRef<Scene>();

  const subscribeMagnetometer = async () => {
    const available = await Magnetometer.isAvailableAsync();
    if (available) {
      let { status } = await Magnetometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access Magnetometer was denied');
        return;
      }
      Magnetometer.setUpdateInterval(50);
      const subscription = Magnetometer.addListener(data => appendMagnetometerData(data))
      setMagnetometerSubscription(subscription);
      console.log('Magnetometer available');
    } else {
      console.log('Magnetometer not available');
    }
  };

  const appendMagnetometerData = (newData: ThreeAxisMeasurement): void => {
    const value = magnetometerFilter.pass(newData);
    setMagnetometerData(value);
  };

  const unsubscribeMagnetometer = () => {
    magnetometerSubscription && magnetometerSubscription.remove();
    setMagnetometerSubscription(undefined);
  };

  const subscribeAccelerometer = async () => {
    const available = await DeviceMotion.isAvailableAsync();
    if (available) {
      let { status } = await DeviceMotion.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access DeviceMotion was denied');
        return;
      }
      DeviceMotion.setUpdateInterval(50);
      const subscription = DeviceMotion.addListener(data => appendAccelerometerData(data.accelerationIncludingGravity))
      setAccelerometerSubscription(subscription);
      console.log('DeviceMotion available');
    } else {
      console.log('DeviceMotion not available');
    }
  };

  const appendAccelerometerData = (newData: ThreeAxisMeasurement): void => {
    const value = accelerometerFilter.pass(newData);
    setAccelerometerData(value);
  };

  const unsubscribeAccelerometer = () => {
    accelerometerSubscription && accelerometerSubscription.remove();
    setAccelerometerSubscription(undefined);
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
    subscribeMagnetometer();
    subscribeAccelerometer();

    return () => { unsubscribeMagnetometer(); unsubscribeAccelerometer() };
  }, []);

  useEffect(() => {
    {
      //console.log(accelerometerData);
      //console.log(magnetometerData);
      
      const rotation = getRotationMatrix(accelerometerData, magnetometerData);
      if (rotation) {
        setOrientation(getOrientation(rotation.rotationMatrix));
      }
    }
  }, [accelerometerData, magnetometerData]);

  const changeView = async () => {
    if (cameraRef.current) {
      const motionForward = accelerometerData.z;

      if (motionForward < 0.01 && Math.abs(Math.sin(orientation.roll)) > 0.5) {
        //console.log('Moving Forward: ' + motionForward);

        const speed = (motionForward * 0.02);
        const movement = speed * 10; // assuming 10 second

        const xMovement = movement * Math.cos(orientation.azimuth + Math.PI/2);
        const yMovement = movement * Math.sin(orientation.azimuth + Math.PI/2);

        //console.log('Movement: ' + xMovement + ' ' + yMovement);

        const { x, y, z } = cameraRef.current.position;
        //cameraRef.current.position.set(x + xMovement, y, z + yMovement);
      }

      const x = -1.0 * Math.sin(orientation.roll) * Math.sin(orientation.azimuth + 3 * Math.PI / 4) + cameraRef.current.position.x;
      const y = -1.0 * Math.sin(orientation.roll) * Math.cos(orientation.azimuth + 3 * Math.PI / 4) + cameraRef.current.position.z;
      const z = Math.cos(orientation.roll) + cameraRef.current.position.y;

      //console.log({ x, y, z });

      cameraRef.current.lookAt(x, z, y);

      //setLocation(await Location.getCurrentPositionAsync({}));
      //console.log(location);
    }
  }

  useEffect(() => {
    changeView();
  }, [orientation]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x000000;
  
    // Create a WebGLRenderer without a DOM element
    const renderer = new WebGLRenderer({ context: gl, canvas: getCanvas(gl), alpha: true });
    renderer.setClearColor(sceneColor, 0);
  
    const camera = new PerspectiveCamera(50, width / height, 0.01, 1000);
    camera.position.set(0, 2, 0);
    camera.lookAt(1, 2, 0);
    cameraRef.current = camera;
  
    const scene = new Scene();
    scene.fog = new Fog(sceneColor, 1, 10000);
    scene.add(new GridHelper(10, 10));

    sceneRef.current = scene;
  
    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    // x+ -> North
    // x- -> South
    // z+ -> East
    // z- -> West
  
    //North - red
    const cube = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color: 0xff0000 }));
    cube.position.set(5, 0, 0);
    scene.add(cube);
  
    // West - green
    const cube1 = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color: 0x00ff00 }));
    cube1.position.set(0, 0, -5);
    scene.add(cube1);

    // East - blue
    const cube2 = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color: 0x0000ff }));
    cube2.position.set(0, 0, 5);
    scene.add(cube2);

    // Up - white
    const cube3 = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color: 0xffffff }));
    cube3.position.set(0, 5, 0);
    scene.add(cube3);
  
    // Setup an animation loop
    const render = () => {
      const timeout = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Camera ratio='2:1' type={ Camera.Constants.Type.back } style={{ width, height }}>
        <Text>direction (phone in horizontal mode): { orientation.azimuth + Math.PI / 2 }</Text>
        <GLView style={{ width, height }} onContextCreate={ onContextCreate } />
      </Camera>
    </View>
  );
}

export default App;