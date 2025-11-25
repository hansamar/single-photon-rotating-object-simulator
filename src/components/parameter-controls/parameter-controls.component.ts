
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SimulationParams {
  rpm: number;
  nFrames: number;
  resolution: { width: number; height: number; };
  photonsPerFrame: number;
  noiseRatio: number;
  fov: number;
  shortTermFrames: number;
  distance: number;
}

@Component({
  selector: 'app-parameter-controls',
  templateUrl: './parameter-controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class ParameterControlsComponent {
  isDisabled = input<boolean>(false);
  params = input.required<SimulationParams>();
  paramsChange = output<SimulationParams>();
  generate = output<void>();

  resolutionString = computed(() => {
    const res = this.params().resolution;
    return `${res.width}`;
  });

  estimatedMemoryMB = computed(() => {
    const { resolution, nFrames } = this.params();
    const resSize = resolution.width * resolution.height;
    
    // Uint16Array uses 2 bytes per element
    const bytes = nFrames * resSize * 2;
    return bytes / (1024 * 1024);
  });
  
  isMemoryExceeded = computed(() => {
    // Set a safe memory limit of 1GB for browser environments
    const MEMORY_LIMIT_MB = 1024; 
    return this.estimatedMemoryMB() > MEMORY_LIMIT_MB;
  });

  updateParam(key: keyof SimulationParams, value: any): void {
    this.paramsChange.emit({ ...this.params(), [key]: value });
  }

  updateResolution(value: string): void {
    const width = parseInt(value, 10);
    const height = width;
    this.paramsChange.emit({ ...this.params(), resolution: { width, height } });
  }

  emitGenerate(): void {
    this.generate.emit();
  }
}