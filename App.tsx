import React from 'react';
import ARView from './ARView';

const gpsMeshes = [
  { shape: 'cube', coordinates: { latitude: 49.627644, longitude: 6.150791, altitude: 0.5 }, color: 0xffff00, scale: 10 },
  { shape: 'cylinder', coordinates: { latitude: 49.630532, longitude: 6.151623, altitude: 0.5 }, color: 0xff00ff, scale: 100 },
];

const renderLimit = 1000;
const updateInterval = 10;

const App = () => {
  return (
    <ARView renderLimit={ renderLimit } updateInterval={ updateInterval } gpsMeshes={ gpsMeshes } />
  );
};

export default App;