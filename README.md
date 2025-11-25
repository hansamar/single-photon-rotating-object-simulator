# Rotating Object Single-Photon LiDAR/ToF Simulator
(旋转目标单光子 LiDAR/ToF 仿真器)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-21.0-dd0031.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.165-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)

**[English](./README_EN.md) | [中文](./README.md)**

> **关键词**: Single-photon Imaging, SPAD, LiDAR, ToF, Drone Propeller, Synthetic Data, Computer Vision, Rotating Object, Motion Artifacts.

<img width="1686" height="650" alt="Image" src="https://github.com/user-attachments/assets/faede718-e521-4599-aabe-5083867741f2" />
<img width="1410" height="1078" alt="Image" src="https://github.com/user-attachments/assets/ea10f8be-9264-48a6-9529-aea6432965e4" />
<img width="1415" height="679" alt="Image" src="https://github.com/user-attachments/assets/ed5874a1-c0b7-4760-a9ec-f2cbc9f5af70" />

## 📖 项目简介 (Introduction)

这是一个基于 Web 的**合成数据生成器**，专为研究**高速旋转目标**（如无人机螺旋桨）的**单光子飞行时间（Time-of-Flight, ToF）**成像而设计。

本项目旨在解决动态目标在低光子通量下的成像难题（如运动伪影、多普勒效应模糊）。通过基于物理的光子级仿真，它能生成带有泊松噪声（Poisson Noise）和环境背景噪声的逼真 ToF 数据，适用于**计算机视觉算法训练**、**深度感知研究**以及**运动伪影校正**算法的开发。

该应用完全运行在浏览器中，利用 **Angular** 构建现代化 UI，使用 **Three.js** 进行 3D 场景建模，并通过 **Web Workers** 实现高性能的并行物理计算。

## ✨ 核心功能 (Key Features)

### 1. 基于物理的光子仿真 (Physically-based Simulation)
* **光子统计模型**: 模拟单光子雪崩二极管 (SPAD) 的探测过程，包含信号光子的泊松分布到达时间和背景噪声。
* **动态运动模拟**: 精确计算螺旋桨在每个时间切片的旋转角度 ($\omega$) 和深度变化 ($Z$)。
* **噪声控制**: 支持自定义环境光噪声比（Noise Ratio）和平均信号光子数。

### 2. 交互式 3D 实验场景 (Interactive 3D Scene)
* **可视化配置**: 集成 Three.js 视图，直观展示探测器与旋转目标的相对位置。
* **拖拽交互**: 可直接在 3D 场景中拖动螺旋桨平台来调整探测距离 (Distance)。

### 3. 全面的参数控制 (Parameter Controls)
* **运动参数**: 转速 (RPM 100-10000)。
* **传感器参数**: 分辨率 (64x64, 128x128, 256x256)、视场角 (FOV)。
* **采集参数**: 帧数 (nFrames)、单帧平均光子数、短时积分帧数。

### 4. 实时可视化与导出 (Visualization & Export)
* **多视图对比**: 同时展示**累积光子图 (Accumulated)**、**真值信号 (Ground Truth)** 和**短时积分图 (Short-Term Integration)**。
* **数据导出**: 支持一键下载生成的原始二进制数据 (`.bin`)，方便导入 MATLAB 或 Python 进行后续处理。

## 🛠️ 技术栈 (Tech Stack)

* **Frontend Framework**: [Angular 18+](https://angular.io/) (Standalone Components, Signals)
* **3D Graphics**: [Three.js](https://threejs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Computation**: Web Workers (用于后台运行密集的蒙特卡洛仿真循环)
* **Build Tool**: Angular CLI / Vite

## 🚀 快速开始 (Getting Started)

### 前置要求
* Node.js (建议 v18 或更高版本)
* npm

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/hansamar/single-photon-rotating-object-simulator.git](https://github.com/hansamar/single-photon-rotating-object-simulator.git)
    cd single-photon-rotating-object-simulator
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```

4.  **访问应用**
    打开浏览器访问 `http://localhost:3000` (或控制台显示的端口)。

## 📖 使用指南 (Usage Guide)

1.  **上传与提取 (Upload & Verify)**:
    * 上传一张叶片的图片（推荐浅色背景深色叶片的图片）。
    * 系统会自动二值化提取叶片的几何形状。

2.  **设置参数 (Set Parameters)**:
    * 调整 **RPM** (转速) 和 **Distance** (距离)。
    * 设置 **Sensor Resolution** (探测器分辨率) 和 **Noise Ratio** (信噪比)。
    * *注意：过高的分辨率和帧数可能会消耗大量内存。*

3.  **3D 预览 (3D Scene)**:
    * 在 3D 视图中观察实验设置。
    * 你可以按住鼠标左键旋转视角，右键平移，或直接拖拽叶片模型调整距离。

4.  **生成数据 (Generate)**:
    * 点击 "Generate Data" 按钮。仿真将在后台 Web Worker 中运行，不会卡顿界面。

5.  **结果分析与下载**:
    * 仿真完成后，查看可视化结果。
    * 点击 "Download .bin File" 保存原始数据。
