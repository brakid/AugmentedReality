import { BoxBufferGeometry, ConeBufferGeometry, CylinderBufferGeometry, Mesh, MeshBasicMaterial, SphereBufferGeometry, TorusBufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
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

export const render = (meshObject: MeshObject): Promise<Mesh> => {
  const meshFunction = getMeshFunction(meshObject.shape);

  if (meshFunction) {
    return meshFunction(meshObject.x, meshObject.y, meshObject.z, meshObject.color, meshObject.scale || 1.0);
  } else {
    return loadObject(meshObject.shape, meshObject.x, meshObject.y, meshObject.z, meshObject.color, meshObject.scale || 1.0);
  }
};

export const getMeshFunction = (shape: string): MeshFunction | undefined => {
  switch(shape) {
    case 'cube': return getCube;
    case 'sphere': return getSphere;
    case 'torus': return getTorus;
    case 'cylinder': return getCylinder;
    case 'cone': return getUpsideDownCone;
  }
  return undefined;
};

export const getCube: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new BoxBufferGeometry(scale, scale, scale), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);

  return Promise.resolve(mesh);
};

export const getSphere: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new SphereBufferGeometry(scale), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);

  return Promise.resolve(mesh);
};

export const getTorus: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new TorusBufferGeometry(), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);

  return Promise.resolve(mesh);
};

export const getCylinder: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new CylinderBufferGeometry(), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);

  return Promise.resolve(mesh);
};

export const getCone: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new ConeBufferGeometry(1 * scale, 2 * scale, 32), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);

  return Promise.resolve(mesh);
};

export const getUpsideDownCone: MeshFunction = (x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const mesh = new Mesh(new ConeBufferGeometry(1 * scale, 2 * scale, 32), new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.rotateZ(Math.PI);

  return Promise.resolve(mesh);
};

export const loadObject = async (fileName: string, x: number, y: number, z: number, color: number, scale: number = 1.0): Promise<Mesh> => {
  const loader = new STLLoader();
  const geometry = await loader.loadAsync(
      fileName,
      progress => {
        console.log(progress);
      });

  return new Mesh(geometry, new MeshBasicMaterial({ color }));
};