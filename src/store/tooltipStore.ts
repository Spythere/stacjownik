import { defineStore } from 'pinia';

const isTooltip = (v: any): v is TooltipType => tooltipKeys.includes(v);

export const tooltipKeys = [
  'DonatorTooltip',
  'BaseTooltip',
  'VehiclePreviewTooltip',
  'SpawnsTooltip',
  'UsersTooltip',
  'HtmlTooltip'
] as const;

export type TooltipType = (typeof tooltipKeys)[number];

export const useTooltipStore = defineStore('tooltipStore', {
  state: () => ({
    mousePos: [0, 0],
    type: null as TooltipType | null,
    content: ''
  }),

  actions: {
    show(_e: MouseEvent, type: string, value?: string) {
      if (!isTooltip(type)) return;

      this.type = type;
      this.content = value ?? '';
    },

    hide() {
      this.type = null;
      this.content = '';
    },

    handle(e: MouseEvent) {
      const targetEl = e
        .composedPath()
        .find((p) => p instanceof HTMLElement && p.getAttribute('data-tooltip-type'));

      if (!targetEl || !(targetEl instanceof HTMLElement)) {
        if (this.type != null) this.hide();

        return;
      }

      const tooltipType = targetEl.getAttribute('data-tooltip-type');
      const tooltipContent = targetEl.getAttribute('data-tooltip-content');

      if (tooltipType && tooltipContent) this.show(e, tooltipType, tooltipContent);
      else if (this.type != null) this.hide();

      this.mousePos[0] = e.pageX;
      this.mousePos[1] = e.pageY;
    }
  }
});
