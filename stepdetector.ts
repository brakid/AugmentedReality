import { ThreeAxisMeasurement } from 'expo-sensors';

export class StepDetector {
  private buffer: ThreeAxisMeasurement[] = [];
  private velocityBuffer: number[] = [];
  private bufferSize: number = 20;
  private zeroMeasurement: ThreeAxisMeasurement = { x: 0.0, y: 0.0, z: 0.0 };
  private lastTimestamp: number = 0;
  private timeDelta: number = 100000;
  private velocityThreshold: number = -0.5;
  private oldVelocityEstimate: number = 0;
  
  private stepCallback: () => void = () => {};
  

  public setStepCallback(stepCallback: () => void) {
    this.stepCallback = stepCallback;
  }

  updateAcceleration(value: ThreeAxisMeasurement): void {
    const currentTimestamp = Date.now();

    this.push(value);

    const worldZ = 
        this.buffer.reduce(
            (oldData, newData) => this.sum(oldData, newData), 
            this.zeroMeasurement);
    worldZ.x /= this.buffer.length;
    worldZ.y /= this.buffer.length;
    worldZ.z /= this.buffer.length;

    const normalizationFactor = this.norm(worldZ);

    worldZ.x /= normalizationFactor;
    worldZ.y /= normalizationFactor;
    worldZ.z /= normalizationFactor;

    const currentZ = this.dot(worldZ, value) - normalizationFactor;

    this.pushVelocity(currentZ);

    const velocityEstimate = this.velocityBuffer.reduceRight((v1, v2) => v1 + v2);

    console.log(velocityEstimate);

    if (velocityEstimate < this.velocityThreshold && this.oldVelocityEstimate >= this.velocityThreshold && (currentTimestamp - this.lastTimestamp > this.timeDelta)) {
      this.stepCallback();
      this.lastTimestamp = currentTimestamp;
      console.log('Step ' + velocityEstimate);
    }
    this.oldVelocityEstimate = velocityEstimate;
  }

  private push(value: ThreeAxisMeasurement) {
    this.buffer.push(value);

    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  private pushVelocity(value: number) {
    this.velocityBuffer.push(value);

    if (this.velocityBuffer.length > this.bufferSize) {
      this.velocityBuffer.shift();
    }
  }

  private sum(value1: ThreeAxisMeasurement, value2: ThreeAxisMeasurement): ThreeAxisMeasurement {
    return {
      x: value1.x + value2.x,
      y: value1.y + value2.y,
      z: value1.z + value2.z,
    }
  }

  private norm(value: ThreeAxisMeasurement): number {
    return Math.sqrt(value.x * value.x + value.y * value.y + value.z * value.z);
  }

  private dot(value1: ThreeAxisMeasurement, value2: ThreeAxisMeasurement): number {
    return value1.x * value2.x + value1.y * value2.y + value1.z * value2.z;
  }
}