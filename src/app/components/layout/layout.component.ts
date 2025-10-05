import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-sidebar (sidebarToggled)="isSidebarCollapsed.set($event)"></app-sidebar>
      <main class="main-content" [class.collapsed]="isSidebarCollapsed()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      overflow-y: auto;
      background: #f8fafc;
      transition: margin-left 0.3s ease;
      position: relative;
    }

    .main-content.collapsed {
      margin-left: 70px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      
      .main-content.collapsed {
        margin-left: 0;
      }
    }

    /* Overlay para móvil */
    @media (max-width: 768px) {
      .layout-container::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .layout-container.sidebar-open::before {
        opacity: 1;
        visibility: visible;
      }
    }
  `]
})
export class LayoutComponent {
  isSidebarCollapsed = signal(false);
}