import { Mesh, Vector3 } from "three";
import { Coordinates } from "./types";

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

export const filter = <T>(array: (T | undefined)[]): T[] => {
  const result: T[] = [];

  array.forEach(value => { if (value) { result.push(value) } });

  return result;
};

export const CONVERSION_FACTOR = 111139;

export const coordinatesToVector = (coordinates: Coordinates): Vector3 => {
  return new Vector3(coordinates.latitude * CONVERSION_FACTOR, coordinates.altitude || 2, coordinates.longitude * CONVERSION_FACTOR);
}