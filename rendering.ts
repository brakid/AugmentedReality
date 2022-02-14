import { BoxBufferGeometry, CylinderBufferGeometry, Mesh, MeshBasicMaterial, SphereBufferGeometry, TorusBufferGeometry } from 'three';
import { coordinatesToVector } from './renderhelper';
import { GPSMeshObject, MeshFunction, MeshObject } from './types';

export const convert = (gpsMeshObject: GPSMeshObject): MeshObject => {
  const position = coordinatesToVector(gpsMeshObject.coordinates);

  return {
    shape: gpsMeshObject.shape,
    x: position.x,
    y: position.y,
    z: position.z,
    color: gpsMeshObject.color,
    scale: gpsMeshObject.scale
  };
}

export const render = (meshObject: MeshObject): Mesh | undefined => {
  const meshFunction = getMeshFunction(meshObject.shape);

  if (meshFunction) {
    return meshFunction(meshObject.x, meshObject.y, meshObject.z, meshObject.color, meshObject.scale || 1.0);
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

export const getCube: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Mesh => {
  const cube = new Mesh(new BoxBufferGeometry(scale, scale, scale), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getSphere: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Mesh => {
  const cube = new Mesh(new SphereBufferGeometry(scale), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getTorus: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Mesh => {
  const cube = new Mesh(new TorusBufferGeometry(), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};

export const getCylinder: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Mesh => {
  const cube = new Mesh(new CylinderBufferGeometry(), new MeshBasicMaterial({ color }));
  cube.position.set(x, y, z);

  return cube;
};