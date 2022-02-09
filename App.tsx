import React, { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View, Text } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { AmbientLight, Fog, GridHelper, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { distance, filter, getCanvas } from './utils';
import { LocationAccuracy, LocationObject, LocationOptions } from 'expo-location';
import { ThreeAxisMeasurement, Magnetometer, DeviceMotion } from 'expo-sensors';
import { Subscription } from 'expo-modules-core';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { getOrientation, getRotationMatrix, Orientation } from './rotation';
import { LowPassFilter } from './lowpassfilter';
import { StepDetector } from './stepdetector';
import { render } from './rendering';

const meshes = [
  { shape: 'cube', x: 1, y: 0.5, z: 0, color: 0xff0000 },
  { shape: 'cylinder', x: 3, y: 0.5, z: 0, color: 0x00ff00 },
  { shape: 'torus', x: 5, y: 0.5, z: 0, color: 0x0000ff },
  { shape: 'sphere', x: 7, y: 0.5, z: 0, color: 0xffffff },
  { shape: 'cube', x: 9, y: 0.5, z: 0, color: 0x000000 },
];

const App = () => {
  const [ objects ] = useState<Mesh[]>(filter(meshes.map(mesh => render(mesh))));
  const [ currentObjects, setCurrentObjects ] = useState<Mesh[]>([]);
  const renderLimit = 5;

  const { width, height } = useWindowDimensions();
  const [ location, setLocation ] = useState<LocationObject>();
  const [ locationSubscription, setLocationSubscription ] = useState<Subscription>();
  const [ orientation, setOrientation ] = useState<Orientation>({ azimuth: 0, pitch: 0, roll: 0 });
  const [ magnetometerFilter ] = useState<LowPassFilter>(new LowPassFilter());
  const [ magnetometerData, setMagnetometerData ] = useState<ThreeAxisMeasurement>({ x: 0, y: 0, z: 0 });
  const [ magnetometerSubscription, setMagnetometerSubscription ] = useState<Subscription>();
  const [ accelerometerFilter ] = useState<LowPassFilter>(new LowPassFilter());
  const [ accelerometerData, setAccelerometerData ] = useState<ThreeAxisMeasurement>({ x: 0, y: 0, z: 0 });
  const [ accelerometerSubscription, setAccelerometerSubscription ] = useState<Subscription>();
  const [ stepDetector ] = useState<StepDetector>(new StepDetector());
  const [ steps, setSteps ] = useState<number>(0);
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
    stepDetector.updateAcceleration(newData);
  };

  const unsubscribeAccelerometer = () => {
    accelerometerSubscription && accelerometerSubscription.remove();
    setAccelerometerSubscription(undefined);
  };

  const subscribeLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const options: LocationOptions = {
      accuracy: LocationAccuracy.BestForNavigation,
      timeInterval: 500,
      distanceInterval: 10
    };
    const subscription = await Location.watchPositionAsync(options, (location => setLocation(location)))
    setLocationSubscription(subscription);

    setLocation(await Location.getCurrentPositionAsync({}));
  };

  const unsubscribeLocation = () => {
    locationSubscription && locationSubscription.remove();
    setLocationSubscription(undefined);
  };

  const initCamera = async () => {
    let { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access camera was denied');
      return;
    }
  };

  useEffect(() => {
    const stepCallback = () => { setSteps(steps => steps + 1) };
    stepDetector.setStepCallback(stepCallback);

    initCamera();
    subscribeMagnetometer();
    subscribeAccelerometer();
    //subscribeLocation();

    return () => { unsubscribeMagnetometer(); unsubscribeAccelerometer(); unsubscribeLocation() };
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

  const changeView = () => {
    if (cameraRef.current) {
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

  const changePosition = () => {
    if (cameraRef.current) {
      const stepWidth = 0.6; // assuming 10 second

      const xMovement = -1.0 * stepWidth * Math.sin(orientation.azimuth + 3 * Math.PI / 4);
      const yMovement = -1.0 * stepWidth * Math.cos(orientation.azimuth + 3 * Math.PI / 4);

      //console.log('Movement: ' + xMovement + ' ' + yMovement);

      const { x, y, z } = cameraRef.current.position;
      cameraRef.current.position.set(x + xMovement, y, z + yMovement);
    }
  }

  const renderObjects = () => {
    if (cameraRef.current && sceneRef.current) {
      const position = cameraRef.current.position;

      //console.log('Position: ' + JSON.stringify(position));

      const objectsToRender = objects.filter(object => distance(position, object.position) < renderLimit);

      //console.log('Objects to render: ' + JSON.stringify(objectsToRender.map(object => object.position)));

      const newObjectsToRender = objectsToRender.filter(object => !currentObjects.includes(object));
      const objectsToRemove = currentObjects.filter(object => !objectsToRender.includes(object));

      newObjectsToRender.map(object => sceneRef.current?.add(object));
      objectsToRemove.map(object => sceneRef.current?.remove(object));

      setCurrentObjects(objectsToRender);
    }
  };

  useEffect(() => {
    changePosition();
    renderObjects();
  }, [steps]);

  const updatePosition = () => {
    if (cameraRef.current && location) {
      cameraRef.current.position.set(location.coords.latitude, 2, location.coords.longitude);
    }
  }

  useEffect(() => {
    updatePosition();
    renderObjects();
  }, [location]);

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
    scene.add(new GridHelper(100, 100));

    sceneRef.current = scene;
  
    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    // x+ -> North
    // x- -> South
    // z+ -> East
    // z- -> West

    renderObjects();
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
        <GLView style={{ width, height }} onContextCreate={ onContextCreate } />
      </Camera>
    </View>
  );
};

export default App;