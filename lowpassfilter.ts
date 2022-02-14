import { ThreeAxisMeasurement } from 'expo-sensors';

export class LowPassFilter {
  private buffer: ThreeAxisMeasurement[] = [];
  private smoothingFactor: number = 0.3;
  private bufferSize: number = 50;
  private zeroMeasurement: ThreeAxisMeasurement = { x: 0.0, y: 0.0, z: 0.0 };

  pass(value: ThreeAxisMeasurement): ThreeAxisMeasurement {
    const removed = this.push(value);

    const smoothedValue = 
        this.buffer.reduce(
            (oldData, newData) => this.smooth(oldData, newData), 
            removed);
    this.buffer.pop();
    this.buffer.push(smoothedValue);

    return smoothedValue;
  }

  private push(value: ThreeAxisMeasurement): ThreeAxisMeasurement {
    this.buffer.push(value);

    if (this.buffer.length > this.bufferSize) {
      return this.buffer.shift() || this.zeroMeasurement;
    }

    return this.zeroMeasurement;
  }

  private smooth(oldValue: ThreeAxisMeasurement, newValue: ThreeAxisMeasurement): ThreeAxisMeasurement {
    return {
      x: (1 - this.smoothingFactor) * oldValue.x + this.smoothingFactor * newValue.x,
      y: (1 - this.smoothingFactor) * oldValue.y + this.smoothingFactor * newValue.y,
      z: (1 - this.smoothingFactor) * oldValue.z + this.smoothingFactor * newValue.z,
    }
  }
}