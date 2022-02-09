import { BoxBufferGeometry, CylinderBufferGeometry, Mesh, MeshBasicMaterial, SphereBufferGeometry, TorusBufferGeometry } from 'three';

export interface MeshObject {
  shape: string,
  x: number, 
  y: number, 
  z: number, 
  color: number
};

type MeshFunction = (x: number, y: number, z: number, color: number) => Mesh;

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
  const cube = new Mesh(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshBasicMaterial({ color }));
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