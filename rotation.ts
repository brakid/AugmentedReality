import { ThreeAxisMeasurement } from 'expo-sensors';

export interface Rotation {
  inclinationMatrix: number[],
  rotationMatrix: number[],
};

export interface Orientation {
  azimuth: number, // z axis rotation
  pitch: number, // x axis rotation
  roll: number, // y axis rotation
};

// https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/android/hardware/SensorManager.java;l=83?q=SensorManager
export const getRotationMatrix = (accelerometerData: ThreeAxisMeasurement, magnetormeterData: ThreeAxisMeasurement): Rotation | undefined => {
  //console.log('A ' + JSON.stringify(accelerometerData));
  //console.log('M ' + JSON.stringify(magnetormeterData));
  
  let Ax = accelerometerData.x;
  let Ay = accelerometerData.y;
  let Az = accelerometerData.z;

  const normsqA = (Ax * Ax + Ay * Ay + Az * Az);
  const g = 9.81;

  const freeFallGravitySquared = 0.01 * g * g;
  
  if (normsqA < freeFallGravitySquared) {
    // gravity less than 10% of normal value
    console.log('Gravity too low');
    return undefined;
  }

  const Ex = magnetormeterData.x;
  const Ey = magnetormeterData.y;
  const Ez = magnetormeterData.z;

  let Hx = Ey * Az - Ez * Ay;
  let Hy = Ez * Ax - Ex * Az;
  let Hz = Ex * Ay - Ey * Ax;

  const normH = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);

  if (normH < 0.1) {
    // device is close to free fall (or in space?), or close to
    // magnetic north pole. Typical values are > 100.
    console.log('Free fall or close to North Pole');
    return undefined;
  }

  const invH = 1.0 / normH;
  Hx *= invH;
  Hy *= invH;
  Hz *= invH;
  const invA = 1.0 / Math.sqrt(Ax * Ax + Ay * Ay + Az * Az);
  Ax *= invA;
  Ay *= invA;
  Az *= invA;
  const  Mx = Ay * Hz - Az * Hy;
  const My = Az * Hx - Ax * Hz;
  const Mz = Ax * Hy - Ay * Hx;

  const rotationMatrix: number[] = [];
  rotationMatrix.push(Hx, Hy, Hz);
  rotationMatrix.push(Mx, My, Mz);
  rotationMatrix.push(Ax, Ay, Az);

  const invE = 1.0 / Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez);
  const c = (Ex * Mx + Ey * My + Ez * Mz) * invE;
  const s = (Ex * Ax + Ey * Ay + Ez * Az) * invE;
  
  const inclinationMatrix: number[] = [];
  inclinationMatrix.push(1, 0, 0);
  inclinationMatrix.push(0, c, s);
  inclinationMatrix.push(0, -s, c);
  
  return { rotationMatrix, inclinationMatrix};
};

export const getOrientation = (rotationMatrix: number[]): Orientation => {
  const azimuth = Math.atan2(rotationMatrix[1], rotationMatrix[4]);
  const pitch = Math.asin(-rotationMatrix[7]);
  const roll = Math.atan2(-rotationMatrix[6], rotationMatrix[8]);

  return { azimuth, pitch, roll };
}

export const getInclination = (inclinationMatrix: number[]): number => {
  return Math.atan2(inclinationMatrix[5], inclinationMatrix[4]);
}
