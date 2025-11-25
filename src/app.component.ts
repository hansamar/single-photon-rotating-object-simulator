
import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParameterControlsComponent, SimulationParams } from './components/parameter-controls/parameter-controls.component';
import { VisualizationComponent } from './components/visualization/visualization.component';
import { SceneComponent } from './components/scene/scene.component';
import { SimulationService, SimulationResult } from './services/simulation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ParameterControlsComponent, VisualizationComponent, SceneComponent],
})
export class AppComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private simulationService = inject(SimulationService);

  uploadedImage = signal<HTMLImageElement | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  binarizedImageUrl = signal<string | null>(null);
  isLoading = signal(false);
  progress = signal(0);
  simulationResult = signal<SimulationResult | null>(null);

  params = signal<SimulationParams>({
    rpm: 3000,
    nFrames: 50000,
    resolution: { width: 128, height: 128 },
    photonsPerFrame: 10,
    noiseRatio: 1.0,
    fov: 20,
    shortTermFrames: 100,
    distance: 5.0,
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.uploadedImageUrl.set(imageUrl);
        this.binarizedImageUrl.set(null);
        this.simulationResult.set(null);

        const image = new Image();
        image.onload = () => {
          this.uploadedImage.set(image);
          this.generateBinarizedPreview(image);
        };
        image.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  private generateBinarizedPreview(image: HTMLImageElement): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context for binarization preview.');
      return;
    }
  
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
  
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const { data, width, height } = imageData;
    const outputImageData = ctx.createImageData(width, height);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
  
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const out_i = i;
  
        if (alpha > 128 && luminance < 128) {
          outputImageData.data[out_i] = 0;
          outputImageData.data[out_i + 1] = 0;
          outputImageData.data[out_i + 2] = 0;
          outputImageData.data[out_i + 3] = 255;
        } else {
          outputImageData.data[out_i] = 255;
          outputImageData.data[out_i + 1] = 255;
          outputImageData.data[out_i + 2] = 255;
          outputImageData.data[out_i + 3] = 255;
        }
      }
    }
  
    ctx.putImageData(outputImageData, 0, 0);
    this.binarizedImageUrl.set(canvas.toDataURL());
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  async onGenerate(): Promise<void> {
    const image = this.uploadedImage();
    if (!image) {
      alert('Please upload a propeller image first.');
      return;
    }

    this.isLoading.set(true);
    this.progress.set(0);
    this.simulationResult.set(null);

    this.simulationService.runSimulation(image, this.params()).subscribe({
      next: (message) => {
        if (message.type === 'progress') {
          this.progress.set(message.value);
        } else if (message.type === 'result') {
          this.simulationResult.set(message);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Simulation failed:', err);
        alert('An error occurred during the simulation.');
        this.isLoading.set(false);
      }
    });
  }

  onDownload(): void {
    const result = this.simulationResult();
    if (!result || !result.binaryData) {
      return;
    }
    const blob = new Blob([result.binaryData], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drone_propeller_tof.bin';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  onDistanceChange(distance: number): void {
    this.params.update(p => ({ ...p, distance }));
  }
}
