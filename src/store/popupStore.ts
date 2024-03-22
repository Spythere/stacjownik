import { defineStore } from 'pinia';

export const usePopupStore = defineStore('popupStore', {
  state: () => ({
    popupPosition: { x: 0, y: 0 },
    currentPopupComponent: null as
      | null
      | 'DonatorPopUp'
      | 'TrainCommentsPopUp'
      | 'VehiclePreviewPopUp',
    currentPopupContent: '',
    donatorPopupVisible: false
  }),

  actions: {
    onPopUpShow(e: MouseEvent, componentKey: typeof this.currentPopupComponent, value?: string) {
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
