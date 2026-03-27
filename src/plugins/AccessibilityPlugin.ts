import { registerPlugin } from '@capacitor/core';

export interface AccessibilityPlugin {
  clickAt(options: { x: number; y: number }): Promise<{ success: boolean }>;
  getContacts(): Promise<{ contacts: any[] }>;
  getSMS(): Promise<{ sms: any[] }>;
}

const Accessibility = registerPlugin<AccessibilityPlugin>('Accessibility');

export default Accessibility;
