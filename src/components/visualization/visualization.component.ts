
import { Component, ChangeDetectionStrategy, input, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VisualizationData {
  accumulated: ImageData;
  groundTruth: ImageData;
  shortTerm: ImageData;
}

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class VisualizationComponent {
  data = input<VisualizationData | null>();

  accumulatedCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('accumulatedCanvas');
  groundTruthCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('groundTruthCanvas');
  shortTermCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('shortTermCanvas');
  
  constructor() {
    effect(() => {
      const vizData = this.data();
      if (vizData) {
        this.drawCanvas(this.accumulatedCanvas(), vizData.accumulated, 'Accumulated (Signal + Noise)');
        this.drawCanvas(this.groundTruthCanvas(), vizData.groundTruth, 'Ground Truth Signal');
        this.drawCanvas(this.shortTermCanvas(), vizData.shortTerm, 'Short-Term Integration');
      }
    });
  }

  private drawCanvas(canvasRef: ElementRef<HTMLCanvasElement>, imageData: ImageData, title: string) {
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    // Create an offscreen canvas to put the image data
    const offscreenCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if(!offscreenCtx) return;
    offscreenCtx.putImageData(imageData, 0, 0);

    // Draw the scaled image on the visible canvas
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
  }
}
