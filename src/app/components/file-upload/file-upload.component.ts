import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <!-- Vista previa de la imagen actual -->
      <div class="current-image" *ngIf="currentImageUrl && !selectedFile">
        <img [src]="currentImageUrl" [alt]="label" class="preview-image">
        <button type="button" class="btn-remove" (click)="removeCurrentImage()" title="Eliminar imagen">
          ×
        </button>
      </div>

      <!-- Vista previa del archivo seleccionado -->
      <div class="file-preview" *ngIf="selectedFile">
        <img [src]="previewUrl" [alt]="label" class="preview-image">
        <div class="file-info">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
        <button type="button" class="btn-remove" (click)="clearSelection()" title="Cancelar">
          ×
        </button>
      </div>

      <!-- Área de selección de archivo -->
      <div class="upload-area" *ngIf="!selectedFile && !currentImageUrl" 
           [class.dragover]="isDragOver"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <div class="upload-icon">📁</div>
        <p class="upload-text">
          Arrastra una imagen aquí o 
          <span class="upload-link">haz clic para seleccionar</span>
        </p>
        <p class="upload-hint">{{ hint }}</p>
      </div>

      <!-- Botón para cambiar imagen existente -->
      <button type="button" 
              class="btn-change" 
              *ngIf="(currentImageUrl || selectedFile) && !uploading"
              (click)="fileInput.click()">
        {{ selectedFile ? 'Cambiar archivo' : 'Cambiar imagen' }}
      </button>

      <!-- Input de archivo oculto -->
      <input #fileInput
             type="file"
             [accept]="accept"
             (change)="onFileSelected($event)"
             style="display: none">

      <!-- Estado de carga -->
      <div class="upload-status" *ngIf="uploading">
        <div class="spinner"></div>
        <span>Subiendo...</span>
      </div>

      <!-- Mensajes de error -->
      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <!-- Botones de acción -->
      <div class="upload-actions" *ngIf="selectedFile && !uploading">
        <button type="button" class="btn-secondary" (click)="clearSelection()">
          Cancelar
        </button>
        <button type="button" class="btn-primary" (click)="uploadFile()">
          Subir {{ label }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      border: 2px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
      background: #f9fafb;
      position: relative;
    }

    .current-image {
      position: relative;
      display: inline-block;
      margin-bottom: 1rem;
    }

    .preview-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .btn-remove {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
    }

    .btn-remove:hover {
      background: #dc2626;
    }

    .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      position: relative;
    }

    .file-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-name {
      font-weight: 500;
      color: #1f2937;
    }

    .file-size {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .upload-area {
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px dashed #d1d5db;
      border-radius: 0.5rem;
      background: white;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-text {
      margin: 0 0 0.5rem 0;
      color: #4b5563;
    }

    .upload-link {
      color: #3b82f6;
      font-weight: 500;
    }

    .upload-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .btn-change {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      margin-top: 1rem;
    }

    .btn-change:hover {
      background: #2563eb;
    }

    .upload-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      color: #3b82f6;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: #fef2f2;
      border-radius: 0.25rem;
    }

    .upload-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class FileUploadComponent {
  @Input() label: string = 'imagen';
  @Input() accept: string = 'image/*';
  @Input() hint: string = 'Formatos: JPG, PNG, WebP (máx. 5MB)';
  @Input() currentImageUrl: string | null = null;
  @Input() userId: string = '';
  @Input() fileType: 'profile' | 'signature' = 'profile';
  
  @Output() fileUploaded = new EventEmitter<string>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;
  uploading = false;
  errorMessage = '';

  constructor(private fileUploadService: FileUploadService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File) {
    this.errorMessage = '';

    // Validar tipo de archivo
    if (!this.fileUploadService.isValidImageFile(file)) {
      this.errorMessage = 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP, GIF)';
      return;
    }

    // Validar tamaño
    if (!this.fileUploadService.isValidFileSize(file, 5)) {
      this.errorMessage = 'El archivo es demasiado grande. Máximo 5MB permitido.';
      return;
    }

    this.selectedFile = file;
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadFile() {
    if (!this.selectedFile || !this.userId) return;

    this.uploading = true;
    this.errorMessage = '';

    try {
      const fileExtension = this.fileUploadService.getFileExtension(this.selectedFile.name);
      const filePath = this.fileUploadService.generateFilePath(this.userId, this.fileType, fileExtension);
      
      const downloadURL = await this.fileUploadService.uploadFile(this.selectedFile, filePath);
      
      this.fileUploaded.emit(downloadURL);
      this.clearSelection();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al subir el archivo';
    } finally {
      this.uploading = false;
    }
  }

  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = '';
  }

  removeCurrentImage() {
    this.fileRemoved.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}