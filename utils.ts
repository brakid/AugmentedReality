import { ExpoWebGLRenderingContext } from "expo-gl";

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

export const smooth = (oldValue: number, newValue: number, factor: number = 1.0): number => {
  return (oldValue + factor * newValue) / (1.0 + factor);
}

export const calculateAngle = (y: number, z: number): number => {
  if (Math.atan2(z, y) >= 0) {
    return round((Math.atan2(z, y) * (180 / Math.PI)));
  } else {
    return round(((Math.atan2(z, y) + 2 * Math.PI) * (180 / Math.PI)));
  }
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
  return -1.0 * Math.PI * (((angle % 360) / 180) - 1);
};