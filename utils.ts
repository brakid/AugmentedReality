import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Mesh, Vector3 } from 'three';

export const getCanvas = (gl: ExpoWebGLRenderingContext): HTMLCanvasElement => {
  return ({
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    style: {},
    addEventListener: (() => {}) as any,
    removeEventListener: (() => {}) as any,
    clientHeight: gl.drawingBufferHeight,
  } as HTMLCanvasElement);
};

export const round = (value: number, digits: number = 2): number => {
  return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}

export const smooth = (oldValue: number, newValue: number, factor: number = 0.3): number => {
  return (oldValue + factor * newValue) / (1.0 + factor);
}

export const calculateAngle = (x: number, y: number): number => {
  return (Math.atan2(y, x) * (180 / Math.PI)) + 2.47;
};

export const calculateDirection = (angle: number): string => {
  if (angle > 45 && angle <= 135) {
    return 'S';
  }
  if (angle > 135 && angle <= 225) {
    return 'W';
  }
  if (angle > 225 && angle <= 315) {
    return 'N';
  }
  return 'E'
};

export const getDirection = (angle: number): number => {
  return -1.0 * ((Math.PI / 180)) * (angle - 180);
};

export const distance = (position: Vector3, objectPosition: Vector3): number => {
  return Math.sqrt(
    (position.x - objectPosition.x) * (position.x - objectPosition.x) + 
    (position.z - objectPosition.z) * (position.z - objectPosition.z))
};

export const compare = (position: Vector3): ((object1: Mesh, object2: Mesh) => number) => {
  return (object1, object2) => {
    if (distance(position, object1.position) < distance(position, object2.position)){
      return -1;
    }
    if (distance(position, object1.position) > distance(position, object2.position)){
      return 1;
    }
    return 0;
  };
};