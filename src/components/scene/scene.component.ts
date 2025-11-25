import { Component, ChangeDetectionStrategy, input, output, viewChild, ElementRef, AfterViewInit, OnDestroy, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  propellerImage = input<HTMLImageElement | null>(null);
  rpm = input<number>(3000);
  distance = input<number>(5.0);
  distanceChange = output<number>();

  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('sceneCanvas');

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private orbitControls!: OrbitControls;
  private dragControls!: DragControls;

  private platformGroup!: THREE.Group;
  private propellerMesh: THREE.Mesh | null = null;
  private animationFrameId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => this.updatePropellerMesh(this.propellerImage()));
    effect(() => this.updatePlatformPosition(this.distance()));
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.createStaticObjects();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer?.dispose();
    this.orbitControls?.dispose();
    this.dragControls?.dispose();
  }

  private initScene(): void {
    const canvasEl = this.canvas().nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x21262d);

    this.camera = new THREE.PerspectiveCamera(50, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100);
    this.camera.position.set(3, 2, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
    this.renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
  }

  private createStaticObjects(): void {
    // Detector
    const detectorGeom = new THREE.BoxGeometry(0.5, 0.5, 0.8);
    const detectorMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const detector = new THREE.Mesh(detectorGeom, detectorMat);
    const lensGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.45;
    detector.add(lens);
    detector.position.z = 0.5;
    this.scene.add(detector);

    // Platform Group (now an invisible draggable container for the propeller)
    this.platformGroup = new THREE.Group();
    this.platformGroup.position.z = -this.distance();
    this.scene.add(this.platformGroup);
    
    this.setupDragControls();
  }

  private setupDragControls(): void {
    this.dragControls = new DragControls([this.platformGroup], this.camera, this.renderer.domElement);
    this.dragControls.addEventListener('dragstart', () => this.orbitControls.enabled = false);
    this.dragControls.addEventListener('dragend', () => this.orbitControls.enabled = true);
    this.dragControls.addEventListener('drag', (event) => {
      // Constrain movement to Z-axis
      event.object.position.x = 0;
      event.object.position.y = 0;
      // Clamp z position to be negative (away from detector)
      if (event.object.position.z > -0.5) {
        event.object.position.z = -0.5;
      }
      this.distanceChange.emit(Math.abs(event.object.position.z));
    });
  }

  private updatePropellerMesh(image: HTMLImageElement | null): void {
    if (this.propellerMesh) {
      this.platformGroup.remove(this.propellerMesh);
      this.propellerMesh.geometry.dispose();
      (this.propellerMesh.material as THREE.MeshStandardMaterial).map?.dispose();
      (this.propellerMesh.material as THREE.MeshStandardMaterial).alphaMap?.dispose();
      this.propellerMesh = null;
    }
    if (!image) return;

    const { canvas: alphaCanvas, centroid } = this.createAlphaMapAndCentroid(image);
    const alphaTexture = new THREE.CanvasTexture(alphaCanvas);
    alphaTexture.needsUpdate = true;

    if (centroid) {
      // Set texture center for rotation. UV coordinates are Y-flipped from canvas coordinates.
      alphaTexture.center.set(centroid.x / image.width, 1 - (centroid.y / image.height));
    }

    const propellerGeom = new THREE.PlaneGeometry(2, 2);
    const propellerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White propeller
      alphaMap: alphaTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.propellerMesh = new THREE.Mesh(propellerGeom, propellerMat);
    this.propellerMesh.position.z = 0; // Propeller is at the group's origin
    this.platformGroup.add(this.propellerMesh);
  }
  
  private createAlphaMapAndCentroid(image: HTMLImageElement): { canvas: HTMLCanvasElement, centroid: { x: number, y: number } | null } {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const { data, width, height } = imageData;

    let sumX = 0;
    let sumY = 0;
    let pointCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      const isPropeller = a > 128 && luminance < 128;

      if (isPropeller) {
        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);
        sumX += x;
        sumY += y;
        pointCount++;
      }
      
      // For an alpha map, the part we want to see should be white (opaque).
      const alphaColor = isPropeller ? 255 : 0;
      data[i] = alphaColor;
      data[i + 1] = alphaColor;
      data[i + 2] = alphaColor;
      data[i + 3] = 255; // Alpha channel itself should be opaque
    }

    ctx.putImageData(imageData, 0, 0);
    const centroid = pointCount > 0 ? { x: sumX / pointCount, y: sumY / pointCount } : null;
    return { canvas, centroid };
  }

  private updatePlatformPosition(newDistance: number): void {
    if (this.platformGroup && this.platformGroup.position.z !== -newDistance) {
      this.platformGroup.position.z = -newDistance;
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.orbitControls.update();

    if (this.propellerMesh) {
      const omega = (this.rpm() * 2 * Math.PI) / 60; // rad/s
      const delta = 1 / 60; // assume 60fps for simplicity
      this.propellerMesh.rotation.z += omega * delta;
    }
    
    // Handle resize
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement;
    if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        this.renderer.setSize(parent.clientWidth, parent.clientHeight);
        this.camera.aspect = parent.clientWidth / parent.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
  }
}