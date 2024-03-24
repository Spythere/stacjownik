import { defineStore } from 'pinia';

export const popupKeys = ['DonatorPopUp', 'TrainCommentsPopUp', 'VehiclePreviewPopUp'] as const;
export type PopUp = (typeof popupKeys)[number];

const isPopUp = (v: any): v is PopUp => popupKeys.includes(v);

export const usePopupStore = defineStore('popupStore', {
  state: () => ({
    popupPosition: { x: 0, y: 0 },
    currentPopupComponent: null as PopUp | null,
    currentPopupContent: '',
    donatorPopupVisible: false
  }),

  actions: {
    onPopUpShow(e: MouseEvent, componentKey: string, value?: string) {
      if (!isPopUp(componentKey)) return;

      this.popupPosition.x = e.pageX;
      this.popupPosition.y = e.pageY;

      this.currentPopupComponent = componentKey;
      this.currentPopupContent = value ?? '';
    },

    onPopUpMove(e: MouseEvent) {
      this.popupPosition.x = e.pageX;
      this.popupPosition.y = e.pageY;
    },

    onPopUpHide() {
      this.currentPopupComponent = null;
      this.currentPopupContent = '';
    }
  }
});
