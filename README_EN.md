# Rotating Object Single-Photon LiDAR/ToF Simulator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-21.0-dd0031.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.165-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)

**[English](./README_EN.md) | [中文](./README.md)**

> **Keywords**: Single-photon Imaging, SPAD, LiDAR, ToF, Drone Propeller, Synthetic Data, Computer Vision, Rotating Object, Motion Artifacts.

<img width="1686" height="650" alt="Image" src="https://github.com/user-attachments/assets/faede718-e521-4599-aabe-5083867741f2" />
<img width="1410" height="1078" alt="Image" src="https://github.com/user-attachments/assets/ea10f8be-9264-48a6-9529-aea6432965e4" />
<img width="1415" height="679" alt="Image" src="https://github.com/user-attachments/assets/ed5874a1-c0b7-4760-a9ec-f2cbc9f5af70" />

## 📖 Introduction

This is a web-based **synthetic data generator** specifically designed for researching **Single-Photon Time-of-Flight (ToF)** imaging of **high-speed rotating objects** (such as drone propellers).

The project aims to address the challenges of imaging dynamic targets under low photon flux conditions (e.g., motion artifacts, Doppler effect blurring). Through physically-based photon-level simulation, it generates realistic ToF data containing **Poisson Noise** and environmental background noise. It is suitable for **Computer Vision algorithm training**, **Depth Sensing research**, and the development of **Motion Artifact Correction** algorithms.

The application runs entirely in the browser, utilizing **Angular** for a modern UI, **Three.js** for 3D scene modeling, and **Web Workers** for high-performance parallel physical computations.

## ✨ Key Features

### 1. Physically-based Simulation
* **Photon Statistical Model**: Simulates the detection process of a Single-Photon Avalanche Diode (SPAD), including Poisson-distributed signal photon arrival times and background noise.
* **Dynamic Motion Simulation**: Precisely calculates the rotation angle ($\omega$) and depth variation ($Z$) of the propeller for every time slice.
* **Noise Control**: Supports customizable environmental **Noise Ratio** and average signal photon counts.

### 2. Interactive 3D Scene
* **Visual Configuration**: Integrated Three.js view to intuitively visualize the relative position between the detector and the rotating target.
* **Drag Interaction**: You can directly drag the propeller platform in the 3D scene to adjust the detection **Distance**.

### 3. Comprehensive Parameter Controls
* **Motion Parameters**: Rotational Speed (RPM 100-10000).
* **Sensor Parameters**: Resolution (64x64, 128x128, 256x256), Field of View (FOV).
* **Acquisition Parameters**: Number of Frames (nFrames), Average Photons per Frame, Short-term Integration Frames.

### 4. Real-time Visualization & Export
* **Multi-View Comparison**: Simultaneously displays **Accumulated Photon Counts**, **Ground Truth Signal**, and **Short-Term Integration**.
* **Data Export**: Supports one-click download of the generated raw binary data (`.bin`) for easy import into MATLAB or Python for further processing.

## 🛠️ Tech Stack

* **Frontend Framework**: [Angular 18+](https://angular.io/) (Standalone Components, Signals)
* **3D Graphics**: [Three.js](https://threejs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Computation**: Web Workers (Used for running intensive Monte Carlo simulation loops in the background)
* **Build Tool**: Angular CLI / Vite

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Installation Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/rotating-object-lidar-sim.git](https://github.com/your-username/rotating-object-lidar-sim.git)
    cd rotating-object-lidar-sim
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Access the application**
    Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## 📖 Usage Guide

1.  **Upload & Verify**:
    * Upload an image of a propeller blade (images with a light background and dark blade are recommended).
    * The system will automatically binarize and extract the geometric shape of the blade.

2.  **Set Parameters**:
    * Adjust **RPM** and **Distance**.
    * Set **Sensor Resolution** and **Noise Ratio**.
    * *Note: Excessively high resolutions and frame counts may consume significant memory.*

3.  **3D Scene Preview**:
    * Observe the experimental setup in the 3D view.
    * You can hold the left mouse button to rotate the view, the right button to pan, or directly drag the blade model to adjust the distance.

4.  **Generate Data**:
    * Click the "Generate Data" button. The simulation will run in a background Web Worker without freezing the interface.

5.  **Results Analysis & Download**:
    * Once the simulation is complete, view the visualization results.
    * Click "Download .bin File" to save the raw data.
