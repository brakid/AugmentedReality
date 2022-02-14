import { ExpoWebGLRenderingContext } from 'expo-gl';

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