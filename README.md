# 旋转目标单光子 LiDAR/ToF 仿真器

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
![Angular](https://img.shields.io/badge/Angular-21.0-dd0031.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.165-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)

**[English](./README_EN.md) | [中文](./README.md)**

> 关键词：Single-photon Imaging、SPAD、LiDAR、ToF、Drone Propeller、Synthetic Data、Computer Vision、Rotating Object、Motion Artifacts。

<img width="1686" height="650" alt="Simulator overview" src="https://github.com/user-attachments/assets/faede718-e521-4599-aabe-5083867741f2" />
<img width="1410" height="1078" alt="Simulation controls" src="https://github.com/user-attachments/assets/ea10f8be-9264-48a6-9529-aea6432965e4" />
<img width="1415" height="679" alt="Simulation results" src="https://github.com/user-attachments/assets/ed5874a1-c0b7-4760-a9ec-f2cbc9f5af70" />

## 项目简介

这是一个在浏览器中运行的合成数据生成器，用于研究高速旋转目标（例如无人机螺旋桨）的单光子飞行时间（Time-of-Flight, ToF）成像。

该应用根据上传的叶片图像提取目标形状，模拟旋转运动、信号光子的泊松统计和背景噪声，并导出可用于 MATLAB 或 Python 后续处理的原始 `.bin` 数据。界面使用 Angular 构建，Three.js 用于展示 3D 实验场景，计算密集型仿真在 Web Worker 中运行。

## 项目状态

当前版本为 `v0.1.0`，适合用于概念验证、算法开发和可复现实验探索。

该项目仍处于早期阶段。当前模型是面向研究原型的简化仿真器，不代表经过校准的硬件数字孪生，也不应直接用于工程性能承诺。后续工作见 [ROADMAP.md](./ROADMAP.md)。

## 核心功能

### 1. 基于物理过程的光子仿真

- 模拟单光子雪崩二极管（SPAD）的探测过程。
- 使用泊松统计生成信号光子，并加入可配置的背景噪声。
- 按时间切片计算叶片旋转角度和相对深度。
- 当前单帧积分时间为 `20 µs`，时间数字转换器（TDC）分辨率为 `256 ps`。

### 2. 交互式 3D 实验场景

- 使用 Three.js 展示探测器与旋转目标的相对位置。
- 支持在 3D 场景中拖动目标平台，调整探测距离。

### 3. 参数控制

- 运动参数：转速 `RPM 100-10000`。
- 传感器参数：分辨率 `64x64`、`128x128`、`256x256` 和视场角（FOV）。
- 采集参数：帧数、单帧平均光子数、背景噪声比和短时积分帧数。

### 4. 可视化与数据导出

- 同时显示累积光子图、真值信号图和短时积分图。
- 支持下载原始二进制数据（`.bin`）。

## 快速开始

### 环境要求

- Node.js `20.19+`、`22.12+` 或 `24+`
- npm

### 安装与运行

```bash
git clone https://github.com/hansamar/single-photon-rotating-object-simulator.git
cd single-photon-rotating-object-simulator
npm install
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

### 构建检查

```bash
npm run build
```

## 使用流程

1. 上传一张叶片图片。建议使用浅色背景和深色叶片。
2. 检查自动提取的二值化形状。
3. 调整 RPM、距离、分辨率、视场角、帧数和噪声参数。
4. 在 3D 场景中检查实验配置。
5. 点击 `Generate Data` 生成数据。
6. 查看可视化结果，并使用 `Download .bin File` 下载原始数据。

高分辨率和较大的帧数会显著增加内存占用。

## 参与贡献

欢迎提交问题报告、文档改进和经过说明的仿真模型改进。请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 版本记录

版本变化见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

本项目使用 [MIT License](./LICENSE)。
