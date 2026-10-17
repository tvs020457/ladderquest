/**
 * Haptics Engine for LadderQuest
 * Provides tactile feedback for mobile touch devices via the Web Vibration API.
 * Gracefully degrades on unsupported platforms without errors.
 */

class HapticsManager {
  private enabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('ladderquest_haptics_enabled');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('ladderquest_haptics_enabled', String(val));
    } catch {}
  }

  private trigger(pattern: number | number[]) {
    if (!this.enabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }

  /**
   * Subtle micro-tap for buttons, navigation tabs, and slots
   */
  public tap() {
    this.trigger(10);
  }

  /**
   * Solid mechanical click for wire connections and placing logic elements
   */
  public snap() {
    this.trigger(18);
  }

  /**
   * Soft disconnect sensation when removing a wire
   */
  public disconnect() {
    this.trigger(12);
  }

  /**
   * Triumphant double-pulse for passing levels, completing quests, or claiming rewards
   */
  public success() {
    this.trigger([18, 50, 32]);
  }

  /**
   * Warning vibration for short circuits, floating wires, or test failures
   */
  public error() {
    this.trigger([45, 60, 45]);
  }

  /**
   * Special pulse for streak updates
   */
  public pulse() {
    this.trigger([15, 30, 15, 30, 20]);
  }
}

export const haptics = new HapticsManager();
