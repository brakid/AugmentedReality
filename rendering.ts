import { BoxBufferGeometry, CylinderBufferGeometry, Mesh, MeshBasicMaterial, SphereBufferGeometry, TorusBufferGeometry } from 'three';
import { Coordinates, coordinatesToVector } from './utils';

export interface GPSMeshObject {
  shape: string,
  coordinates: Coordinates, 
  color: number
};

export interface MeshObject {
  shape: string,
  x: number, 
  y: number, 
  z: number, 
  color: number
};

type MeshFunction = (x: number, y: number, z: number, color: number) => Mesh;

export const convert = (gpsMeshObject: GPSMeshObject): MeshObject => {
  const position = coordinatesToVector(gpsMeshObject.coordinates);

  return {
    shape: gpsMeshObject.shape,
    x: position.x,
    y: position.y,
    z: position.z,
    color: gpsMeshObject.color
  };
}

export const render = (meshObject: MeshObject): Mesh | undefined => {
  const meshFunction = getMeshFunction(meshObject.shape);

  if (meshFunction) {
    return meshFunction(meshObject.x, meshObject.y, meshObject.z, meshObject.color);
  }

  return undefined;
};

export const getMeshFunction = (shape: string): MeshFunction | undefined => {
  switch(shape) {
    case 'cube': return getCube;
    case 'sphere': return getSphere;
    case 'torus': return getTorus;
    case 'cylinder': return getCylinder;
  }
  return undefined;
};

export const getCube: MeshFunction = (x: number, y: number, z: number, color: number): Mesh => {
  const cube = new Mesh(new BoxBufferGeometry(10.0, 10.0, 10.0), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getSphere: MeshFunction = (x: number, y: number, z: number, color: number): Mesh => {
  const cube = new Mesh(new SphereBufferGeometry(1.0), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getTorus: MeshFunction = (x: number, y: number, z: number, color: number): Mesh => {
  const cube = new Mesh(new TorusBufferGeometry(), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getCylinder: MeshFunction = (x: number, y: number, z: number, color: number): Mesh => {
  const cube = new Mesh(new CylinderBufferGeometry(), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};