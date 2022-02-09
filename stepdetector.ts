import { ThreeAxisMeasurement } from 'expo-sensors';

export class StepDetector {
  private lastTimestamp: number = 0;
  private timeDelta: number = 200;
  private accelerationThreshold: number = 0.5;
  private oldAcceleration: number = 0;
  
  private stepCallback: () => void = () => {};

  public setStepCallback(stepCallback: () => void) {
    this.stepCallback = stepCallback;
  }

  updateAcceleration(value: ThreeAxisMeasurement): void {
    const currentTimestamp = Date.now();

    const accelerationZ = value.z;
    if (accelerationZ > this.accelerationThreshold && this.oldAcceleration <= this.accelerationThreshold && (currentTimestamp - this.lastTimestamp > this.timeDelta)) {
      this.stepCallback();
      this.lastTimestamp = currentTimestamp;
      //console.log('Step ' + accelerationZ);
    }
    this.oldAcceleration = accelerationZ;
  }
}