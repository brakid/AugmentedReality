import { GPSMeshObject } from './types';
import { XMLParser } from 'fast-xml-parser';

export const loadTrack = async (url: string): Promise<GPSMeshObject[]> => {
  const result = await fetch('http://localhost/coordinates.xml');
  const text = await result.text();

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix : ''
  };

  const xmlDoc = new XMLParser(options).parse(text);
  const meshObjects = [];
  for (let point of xmlDoc.gpx.trk.trkseg.trkpt) {
    meshObjects.push({ shape: 'cone', coordinates: { latitude: point.lat, longitude: point.lon, altitude: 0.5 }, color: 0xffff00, scale: 2 });
  }

  return meshObjects;
};
