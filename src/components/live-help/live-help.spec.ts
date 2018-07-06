import { TestWindow } from '@stencil/core/testing';
import { LiveHelp } from './live-help';

describe('live-help', () => {
  it('should build', () => {
    expect(new LiveHelp()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLLiveHelpElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [LiveHelp],
        html: '<live-help></live-help>'
      });
    });

    it('should work without parameters', () => {
      expect(element.textContent.trim()).toEqual("Hello, World! I'm");
    });

    it('should work with a first name', async () => {
      element.organization = 'Peter';
      await testWindow.flush();
      expect(element.textContent.trim()).toEqual("Hello, World! I'm Peter");
    });

    it('should work with a last name', async () => {
      element.last = 'Parker';
      await testWindow.flush();
      expect(element.textContent.trim()).toEqual("Hello, World! I'm  Parker");
    });

    it('should work with both a first and a last name', async () => {
      element.organization = 'Peter';
      element.last = 'Parker';
      await testWindow.flush();
      expect(element.textContent.trim()).toEqual(
        "Hello, World! I'm Peter Parker"
      );
    });
  });
});
