# Rotating Object Single-Photon LiDAR/ToF Simulator

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Angular](https://img.shields.io/badge/Angular-21.0-dd0031.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.165-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)

**[English](./README_EN.md) | [中文](./README.md)**

> Keywords: Single-photon Imaging, SPAD, LiDAR, ToF, Drone Propeller, Synthetic Data, Computer Vision, Rotating Object, Motion Artifacts.

<img width="1686" height="650" alt="Simulator overview" src="https://github.com/user-attachments/assets/faede718-e521-4599-aabe-5083867741f2" />
<img width="1410" height="1078" alt="Simulation controls" src="https://github.com/user-attachments/assets/ea10f8be-9264-48a6-9529-aea6432965e4" />
<img width="1415" height="679" alt="Simulation results" src="https://github.com/user-attachments/assets/ed5874a1-c0b7-4760-a9ec-f2cbc9f5af70" />

## Introduction

This browser-based synthetic data generator supports research on single-photon Time-of-Flight (ToF) imaging of high-speed rotating objects such as drone propellers.

The application extracts a target shape from an uploaded blade image, simulates rotational motion, Poisson-distributed signal photons, and background noise, and exports raw `.bin` data for downstream analysis in MATLAB or Python. Angular provides the user interface, Three.js renders the 3D experimental scene, and a Web Worker runs the compute-intensive simulation.

## Project Status

The current release is `v0.1.0`. It is intended for proof-of-concept studies, algorithm development, and reproducible experimental exploration.

This project is at an early stage. The current model is a simplified research simulator, not a calibrated hardware digital twin, and should not be used for engineering performance claims. See [ROADMAP.md](./ROADMAP.md) for planned work.

## Key Features

### 1. Photon Simulation

- Simulates Single-Photon Avalanche Diode (SPAD) detection.
- Generates signal photons using Poisson statistics and adds configurable background noise.
- Computes blade rotation angle and relative depth for each time slice.
- Uses a `20 µs` integration time per frame and a `256 ps` Time-to-Digital Converter (TDC) resolution.

### 2. Interactive 3D Scene

- Uses Three.js to show the relative positions of the detector and rotating target.
- Supports dragging the target platform in the 3D scene to adjust detection distance.

### 3. Parameter Controls

- Motion: rotational speed from `RPM 100-10000`.
- Sensor: `64x64`, `128x128`, or `256x256` resolution and Field of View (FOV).
- Acquisition: frame count, average photons per frame, background noise ratio, and short-term integration frames.

### 4. Visualization and Data Export

- Displays accumulated photon counts, ground-truth signal, and short-term integration views.
- Downloads raw binary data as a `.bin` file.

## Getting Started

### Requirements

- Node.js `20.19+`, `22.12+`, or `24+`
- npm

### Install and Run

```bash
git clone https://github.com/hansamar/single-photon-rotating-object-simulator.git
cd single-photon-rotating-object-simulator
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

### Build Check

```bash
npm run build
```

## Usage

1. Upload a blade image. A dark blade on a light background is recommended.
2. Check the extracted binary shape.
3. Adjust RPM, distance, resolution, FOV, frame count, and noise parameters.
4. Inspect the experimental configuration in the 3D scene.
5. Click `Generate Data`.
6. Review the visualizations and use `Download .bin File` to export the raw data.

High resolutions and large frame counts can significantly increase memory use.

## Contributing

Issue reports, documentation improvements, and well-explained simulation model improvements are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before contributing.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

This project is available under the [MIT License](./LICENSE).
