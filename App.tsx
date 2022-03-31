import React, { useEffect, useState } from 'react';
import ARView from './ARView';
import { loadTrack } from './trackloader';
import { GPSMeshObject } from './types';



const gpsMeshes = [
  { shape: 'cone', coordinates: { latitude: 49.627644, longitude: 6.150791, altitude: 0.5 }, color: 0xffff00, scale: 2 },
  { shape: 'cylinder', coordinates: { latitude: 49.630532, longitude: 6.151623, altitude: 0.5 }, color: 0xff00ff, scale: 500 },
  { shape: 'sphere', coordinates: { latitude: 49.624681, longitude: 6.153515, altitude: 0.5 }, color: 0x00ffff, scale: 100 },
  //{ shape: './assets/object.stl', coordinates: { latitude: 49.624681, longitude: 6.153515, altitude: 0.5 }, color: 0x00ffff, scale: 100 },
];

const renderLimit = 5000;
const updateInterval = 5;

const App = () => {
  const [ meshObjects, setMeshObjects ] = useState<GPSMeshObject[]>([]);

  useEffect(() => {
    const init = async () => {
      setMeshObjects(await loadTrack(''));
    };

    init();
  });

  if (meshObjects.length == 0) {
    return null;
  }

  return (
    <ARView renderLimit={ renderLimit } updateInterval={ updateInterval } gpsMeshes={ meshObjects } />
  );
};

export default App;