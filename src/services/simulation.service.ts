
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SimulationParams } from '../components/parameter-controls/parameter-controls.component';
import { VisualizationData } from '../components/visualization/visualization.component';

export interface SimulationResult {
  type: 'result';
  visualizationData: VisualizationData;
  binaryData: Uint16Array;
}
export interface SimulationProgress {
  type: 'progress';
  value: number;
}
export type SimulationMessage = SimulationResult | SimulationProgress;

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private worker: Worker | null = null;

  runSimulation(image: HTMLImageElement, params: SimulationParams): Observable<SimulationMessage> {
    if (this.worker) {
      this.worker.terminate();
    }
    
    const subject = new Subject<SimulationMessage>();

    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    if(!ctx) {
        subject.error('Could not create offscreen canvas context');
        return subject.asObservable();
    }
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    const workerCode = this.getWorkerCode();
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(workerBlob));
    
    this.worker.onmessage = (event: MessageEvent<SimulationMessage>) => {
      subject.next(event.data);
      if (event.data.type === 'result') {
        subject.complete();
        this.worker?.terminate();
        this.worker = null;
      }
    };
    
    this.worker.onerror = (error) => {
      subject.error(error);
      this.worker?.terminate();
      this.worker = null;
    };

    this.worker.postMessage({ imageData, params });
    
    return subject.asObservable();
  }

  private getWorkerCode(): string {
    return `
      // --- Worker self ---
      self.onmessage = (event) => {
        const { imageData, params } = event.data;
        runSimulation(imageData, params);
      };

      // --- Color Maps ---
      function jet(t) {
        t = Math.max(0, Math.min(1, t)); // clamp
        let r = 0.0, g = 0.0, b = 0.0;
        
        if (t < 0.375) {
            if (t < 0.125) { // to blue
                 r = 0; g = 0; b = 0.5 + 4 * t; // (0,0,0.5) -> (0,0,1)
            } else { // to cyan
                 r = 0; g = 4 * (t - 0.125); b = 1; // (0,0,1) -> (0,1,1)
            }
        } else if (t < 0.875) {
            if (t < 0.625) { // to yellow
                 r = 4 * (t - 0.375); g = 1; b = 1 - 4 * (t - 0.375); // (0,1,1) -> (1,1,0)
            } else { // to red
                 r = 1; g = 1 - 4 * (t - 0.625); b = 0; // (1,1,0) -> (1,0,0)
            }
        } else { // fade to dark red
            r = 1 - 2 * (t - 0.875); g = 0; b = 0; // (1,0,0) -> (0,0,0)
        }
        
        return [r*255, g*255, b*255];
      }

      function createImage(photonMap, width, height, colorFn) {
        const imgData = new ImageData(width, height);
        let maxCount = 0;
        for (let i = 0; i < photonMap.length; i++) {
          if (photonMap[i] > maxCount) maxCount = photonMap[i];
        }
        
        if (maxCount === 0) maxCount = 1;

        for (let i = 0; i < photonMap.length; i++) {
          const t = Math.sqrt(photonMap[i] / maxCount); // Sqrt for better contrast
          const color = colorFn(t);
          imgData.data[i * 4] = color[0];
          imgData.data[i * 4 + 1] = color[1];
          imgData.data[i * 4 + 2] = color[2];
          imgData.data[i * 4 + 3] = 255;
        }
        return imgData;
      }

      // --- Main Simulation ---
      function runSimulation(imageData, params) {
        // 1. Binarize image to extract propeller points and find centroid.
        const points = [];
        const { width, height, data } = imageData;
        let sumX = 0;
        let sumY = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];
            
            if (alpha > 128) {
              const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
              if (luminance < 128) {
                points.push({ x: x, y: y }); // Store original coordinates
                sumX += x;
                sumY += y;
              }
            }
          }
        }
        
        if (points.length === 0) {
            self.postMessage({ type: 'error', value: 'No points found in image. Please use an image with a clear propeller shape.' });
            return;
        }

        const centroidX = sumX / points.length;
        const centroidY = sumY / points.length;

        // Center all points around their calculated centroid
        for (const p of points) {
          p.x -= centroidX;
          p.y -= centroidY;
        }

        const maxDim = Math.max(width, height);
        const radius = maxDim / 2;

        // 2. Setup parameters
        const { rpm, nFrames, resolution, photonsPerFrame, noiseRatio, fov, shortTermFrames, distance } = params;
        const omega = 2 * Math.PI * rpm / 60.0;
        const FRAME_DURATION_US = 20; // 50kHz
        
        const f_pixel = (resolution.width / 2) / Math.tan(fov * Math.PI / 360);
        const center_row = resolution.height / 2;
        const center_col = resolution.width / 2;

        const signalEvents = [];
        let totalSignalPhotons = 0;

        // 3. Signal generation loop
        const progressUpdateInterval = Math.floor(nFrames / 100);
        for (let i = 0; i < nFrames; i++) {
          if (i % progressUpdateInterval === 0) {
            self.postMessage({ type: 'progress', value: Math.round((i / nFrames) * 100) });
          }
          
          const time = i * (FRAME_DURATION_US * 1e-6);
          const theta = omega * time;
          const cos_t = Math.cos(theta);
          const sin_t = Math.sin(theta);
          
          // Poisson distributed number of photons for this frame
          let nPhotons = 0;
          const L = Math.exp(-photonsPerFrame);
          let p = 1.0;
          do {
            p *= Math.random();
            nPhotons++;
          } while (p > L);
          nPhotons--;

          for (let p_idx = 0; p_idx < nPhotons; p_idx++) {
            const base_point = points[Math.floor(Math.random() * points.length)];
            const p_base_x = base_point.x * (0.8 / radius); // Scale to a virtual radius of 0.8m
            const p_base_y = base_point.y * (0.8 / radius);
            const p_base_z = (Math.random() - 0.5) * 0.05; // Slight z variation

            const p_rot_x = p_base_x * cos_t - p_base_y * sin_t;
            const p_rot_y = p_base_x * sin_t + p_base_y * cos_t;
            const p_rot_z = p_base_z + distance;

            const row = center_row - f_pixel * (p_rot_y / p_rot_z);
            const col = center_col + f_pixel * (p_rot_x / p_rot_z);

            const dist = Math.sqrt(p_rot_x**2 + p_rot_y**2 + p_rot_z**2);
            const tof_ns = (2 * dist / 3e8) * 1e9;
            const tof_units = Math.floor(tof_ns / 0.256);

            const final_row = Math.round(row + (Math.random() - 0.5) * 0.8);
            const final_col = Math.round(col + (Math.random() - 0.5) * 0.8);
            
            if (final_row >= 0 && final_row < resolution.height && final_col >= 0 && final_col < resolution.width && tof_units > 0 && tof_units < 8000) {
              signalEvents.push({ frame: i, row: final_row, col: final_col, tof: tof_units });
              totalSignalPhotons++;
            }
          }
        }
        
        self.postMessage({ type: 'progress', value: 100 });

        // 4. Create dataset and add noise
        const resSize = resolution.width * resolution.height;
        const dataset = new Uint16Array(nFrames * resSize).fill(8001);
        
        // Add signal
        for (const event of signalEvents) {
            const idx = event.frame * resSize + event.row * resolution.width + event.col;
            dataset[idx] = event.tof;
        }

        // Add noise
        const totalNoise = Math.floor(totalSignalPhotons * noiseRatio);
        for (let n = 0; n < totalNoise; n++) {
            const frame = Math.floor(Math.random() * nFrames);
            const row = Math.floor(Math.random() * resolution.height);
            const col = Math.floor(Math.random() * resolution.width);
            const tof = Math.floor(Math.random() * 7999) + 1;
            const idx = frame * resSize + row * resolution.width + col;
            if (dataset[idx] === 8001) { // Avoid overwriting signal
                dataset[idx] = tof;
            }
        }
        
        // 5. Generate visualization images
        const groundTruthMap = new Uint32Array(resSize).fill(0);
        const accumulatedMap = new Uint32Array(resSize).fill(0);
        const shortTermMap = new Uint32Array(resSize).fill(0);
        
        for(let i = 0; i < dataset.length; i++) {
            if(dataset[i] < 8001) {
                const frame_idx = Math.floor(i / resSize);
                const pixel_idx = i % resSize;
                accumulatedMap[pixel_idx]++;
                if (frame_idx < shortTermFrames) {
                    shortTermMap[pixel_idx]++;
                }
            }
        }
        for(const event of signalEvents) {
            const pixel_idx = event.row * resolution.width + event.col;
            groundTruthMap[pixel_idx]++;
        }
        
        const vizData = {
            accumulated: createImage(accumulatedMap, resolution.width, resolution.height, jet),
            groundTruth: createImage(groundTruthMap, resolution.width, resolution.height, jet),
            shortTerm: createImage(shortTermMap, resolution.width, resolution.height, jet),
        };

        // 6. Post final result
        self.postMessage({ type: 'result', visualizationData: vizData, binaryData: dataset }, [dataset.buffer]);
      }
    `;
  }
}