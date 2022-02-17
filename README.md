# AugmentedReality

![AR View](./images/arview.jpg)

* uses [THREE.js](https://threejs.org/) to render 3D Environments
* uses [Expo Sensors](https://docs.expo.dev/versions/latest/sdk/sensors/) to estimate the position as well as to detect motion (step detection)
* allows to specify 3D objects to display on the GPS coordinate system. Objects close to the user (based on their GPS position) will be shown.

## Phone Direction & 3D Rendering
* read the rotation of the phone based on the Accelerometer and Magnetometer data
* translate the sensor readings into a rotation matrix
* convert the rotation into rotation values to be used for the camera looking direction
* change the camera direction based on the device rotation

## Integrate GPS positions into the rendering
* get current location, translate Longitude, Latitude and Altitude into x, y, z coordinates
* render objects in a specified range around the current position
* remove objects from rendering of they are too far away

## Challenges
* noisy sensor readings -> smoothing
* adding/ removing objects from rendering -> diff calculation