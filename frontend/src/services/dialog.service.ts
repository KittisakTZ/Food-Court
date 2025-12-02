// @/services/dialog.service.ts

import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ModernDialog, DialogType } from '@/components/customs/dialog/ModernDialog';

interface DialogOptions {
  title: string;
  description: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
}

class DialogService {
  private container: HTMLDivElement | null = null;
  private root: Root | null = null;

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'modern-dialog-root';
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
    }
  }

  private removeContainer() {
    if (this.container && this.root) {
      this.root.unmount();
      if (this.container.parentNode) {
        document.body.removeChild(this.container);
      }
      this.container = null;
      this.root = null;
    }
  }

  /**
   * แสดง confirmation dialog
   * @returns Promise<boolean> - true ถ้ากด confirm, false ถ้ากด cancel
   */
  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.createContainer();

      const handleClose = () => {
        this.removeContainer();
        resolve(false);
      };

      const handleConfirm = () => {
        this.removeContainer();
        resolve(true);
      };

      if (this.root) {
        this.root.render(
          createElement(ModernDialog, {
            isOpen: true,
            onClose: handleClose,
            onConfirm: handleConfirm,
            title: options.title,
            description: options.description,
            type: options.type || 'confirm',
            confirmText: options.confirmText,
            cancelText: options.cancelText,
          })
        );
      }
    });
  }

  /**
   * แสดง alert dialog (มีปุ่ม OK อย่างเดียว)
   */
  alert(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      this.createContainer();

      const handleClose = () => {
        this.removeContainer();
        resolve();
      };

      if (this.root) {
        this.root.render(
          createElement(ModernDialog, {
            isOpen: true,
            onClose: handleClose,
            onConfirm: handleClose,
            title: options.title,
            description: options.description,
            type: options.type || 'alert',
            confirmText: options.confirmText || 'ตกลง',
            hideCancel: true,
          })
        );
      }
    });
  }

  /**
   * แสดง success dialog
   */
  success(title: string, description: string): Promise<void> {
    return this.alert({ title, description, type: 'success', confirmText: 'เยี่ยม!' });
  }

  /**
   * แสดง error dialog
   */
  error(title: string, description: string): Promise<void> {
    return this.alert({ title, description, type: 'error', confirmText: 'เข้าใจแล้ว' });
  }

  /**
   * แสดง warning dialog
   */
  warning(title: string, description: string): Promise<void> {
    return this.alert({ title, description, type: 'warning', confirmText: 'รับทราบ' });
  }

  /**
   * แสดง info dialog
   */
  info(title: string, description: string): Promise<void> {
    return this.alert({ title, description, type: 'info', confirmText: 'เข้าใจแล้ว' });
  }
}

export const dialogService = new DialogService();
