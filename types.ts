import { Mesh } from 'three';

export interface ARViewProps {
  renderLimit: number,
  updateInterval: number,
  gpsMeshes: GPSMeshObject[];
};

export interface GPSMeshObject {
  shape: string,
  coordinates: Coordinates, 
  color: number,
  scale?: number,
};

export interface MeshObject {
  shape: string,
  x: number, 
  y: number, 
  z: number, 
  color: number,
  scale?: number
};

export type MeshFunction = (x: number, y: number, z: number, color: number, scale: number) => Promise<Mesh>;

export interface Coordinates {
  longitude: number,
  latitude: number,
  altitude: number | null,
};

export interface Rotation {
  inclinationMatrix: number[],
  rotationMatrix: number[],
};

export interface Orientation {
  azimuth: number, // z axis rotation
  pitch: number, // x axis rotation
  roll: number, // y axis rotation
};