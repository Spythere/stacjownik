<template>
  <div class="timetable-view" v-if="stationInfo">
    <div class="view-content">
      <div class="timetable-options">
        <div
          class="option"
          v-for="(option, key) in options"
          :key="key"
          :class="{ checked: option.state }"
          @click="setOption(key, !option.state)"
        >{{ option.name }}</div>
      </div>

      <div class="timetable-wrapper">
        <div class="timetable-title">
          <b>{{ stationInfo.stationName.toUpperCase() }}</b>
        </div>

        <div class="timetable-header">
          <span>DO STACJI</span>
          <span>PRZEZ</span>
          <span>POCIĄG</span>
          <span>PLAN. ODJAZD</span>
          <span>OPÓŹNIENIE</span>
        </div>

        <div class="timetable-body">
          <div class="timetable-item" v-for="timetable in computedRows" :key="timetable.trainNo">
            <div class="row-bar"></div>
            <div class="timetable-row">
              <span class="row-destination">
                <div class="letter-wrapper">
                  <div v-for="(letter, j) in timetable.destinationTable" :key="j" class="letter">
                    <transition name="roll-anim" mode="out-in">
                      <span :key="letter">{{ letter }}</span>
                    </transition>
                  </div>
                </div>
              </span>

              <span class="row-next" ref="next">
                <div v-for="(letter, j) in timetable.nearestStopTable" :key="j" class="letter">
                  <transition name="roll-anim" mode="out-in">
                    <span :key="letter">{{ letter }}</span>
                  </transition>
                </div>
              </span>

              <span class="row-type">
                <div class="letter-wrapper">
                  <span class="letter" v-for="(letter, j) in timetable.trainCategoryTable" :key="j">
                    <transition name="roll-anim" mode="out-in">
                      <span :key="letter">{{ letter }}</span>
                    </transition>
                  </span>
                </div>

                <div class="letter-wrapper">
                  <span class="letter" v-for="(num, j) in timetable.trainNumberTable" :key="j+3">
                    <transition name="roll-anim" mode="out-in">
                      <span :key="num">{{ num }}</span>
                    </transition>
                  </span>
                </div>
              </span>

              <span class="row-time">
                <div class="letter-wrapper">
                  <span class="letter" v-for="(num, h) in timetable.departureHoursTable" :key="h">
                    <transition name="roll-anim" mode="out-in">
                      <span :key="num">{{ num }}</span>
                    </transition>
                  </span>

                  <span>:</span>

                  <span
                    class="letter"
                    v-for="(num, i) in timetable.departureMinutesTable"
                    :key="i + 5"
                  >
                    <transition name="roll-anim" mode="out-in">
                      <span :key="num">{{ num }}</span>
                    </transition>
                  </span>
                </div>
              </span>

              <span class="row-delay">
                <transition name="roll-anim" mode="out-in">
                  <span
                    :key="timetable.delay"
                  >{{ timetable.delay > 0 ? `${timetable.delay} min` : "" }}</span>
                </transition>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div v-if="stationInfo.online">
      {{ stationInfo.stationName }}
    </div>
    <div v-else>Stacja offline!</div>-->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { Howl } from "howler";

import Station from "@/scripts/interfaces/Station";
import Timetable from "@/scripts/interfaces/Timetable";

interface TimetableRow {
  destinationTable: string[];
  destinationString: string;

  nearestStopTable: string[];
  nearestStopString: string;

  departureHoursTable: string[];
  departureHoursString: string;

  departureMinutesTable: string[];
  departureMinutesString: string;

  trainNumberTable: string[];
  trainNumberString: string;

  trainCategoryTable: string[];
  trainCategoryString: string;

  category: string;
  number: number;

  delay: number;
  delayPlate: string;

  departureTimestamp: number;
  arrivalTimestamp: number;
}

const sound = new Howl({
  src: require("@/assets/sound.wav"),
  loop: true,
  autoplay: false,
});

let soundPlaying = false;

const filteredNames = [
  ["ALEKSANDRÓW KUJAWSKI", "ALEKSDR KUJ."],
  ["GDAŃSK GŁÓWNY", "GDAŃSK GŁ."],
  ["GDAŃSK POŁUDNIOWY", "GDAŃSK PŁD."],
  ["ARKADIA ZDRÓJ", "ARKADIA ZDR."],
  ["GRABÓW MIASTO", "GRABÓW M."],
  ["ZGIERZ KONTREWERS", "ZGIERZ KONTR."],
  ["BUCZ WILEŃSKI", "BUCZ WIL."],
  ["SZKLANA PORĘBA", "SZKLANA POR."],
  ["TARNOWO GÓRNE", "TARNOWO G."],
  ["BARGOWICE ZACHÓD", "BARGOWICE Z."],
];

const letterSet: string[] = Array.from(
  " -.,/AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWXYZŹŻ"
);

const numberSet: string[] = Array.from(" 0123456789");

const delaySet: string[] = [
  "5 min",
  "10 min",
  "15 min",
  "20 min",
  "25 min",
  "30 min",
  "35 min",
  "40 min",
  "45 min",
  "50 min",
  "55 min",
  "60 min",
  ">60 min",
];

let globalID = 0;
let letterSeekArray: {
  currentRowIndex: number;
  letterIndex: number;
  currentChar: string;
  finalChar: string;
  arrayName: string;
  numeric: boolean;
  id: number;
}[] = [];

let plateSeekArray: {
  currentRowIndex: number;
  currentPlate: string;
  wantedPlate: string;
}[] = [];

let nextRefreshTime = 0;

@Component
export default class TimetableView extends Vue {
  @Getter("getStationList") stationList!: Station[];

  maxRows = 5;

  options = {
    excludeCargo: { name: "Tylko pasażerskie", state: false },
    playSounds: { name: "Dźwięki", state: false },
  };

  timetableRows: TimetableRow[] = new Array(this.maxRows)
    .fill(0)
    .map((row) => ({
      origin: new Array(13).fill(" "),

      destinationTable: new Array(13).fill(" "),
      destinationString: "",

      nearestStopTable: new Array(13).fill(" "),
      nearestStopString: "",

      departureHoursTable: new Array(2).fill(" "),
      departureHoursString: "",

      departureMinutesTable: new Array(2).fill(" "),
      departureMinutesString: "",

      trainNumberTable: new Array(6).fill(" "),
      trainNumberString: "",

      trainCategoryTable: new Array(3).fill(" "),
      trainCategoryString: "",

      category: "",
      number: 0,

      delay: 0,
      delayPlate: "",

      departureTimestamp: 0,
      arrivalTimestamp: 0,
    }));

  mounted() {
    window.requestAnimationFrame(this.findNextLetters);
  }

  deactivated() {
    this.resetTimetable();
    letterSeekArray.length = 0;
  }

  /* Options */
  setOption(optionKey: string, optionValue: any) {
    this.$set(this.options[optionKey], "state", optionValue);

    // this.options[optionKey].state = optionValue;
  }

  /* ===== */

  resetTimetable(indexFrom: number = 0, forceClear: boolean = false) {
    if (indexFrom > this.maxRows - 1) return;

    console.log("reset");

    for (let i = indexFrom; i < this.timetableRows.length; i++) {
      const currentRow = this.timetableRows[i];

      for (let propName in currentRow) {
        let propValue = currentRow[propName];

        switch (typeof propValue) {
          case "object":
            propValue = propValue.map((v) => " ");
            this.addToSeek(i, propName, propValue, false);
            this.$set(this.timetableRows[i], propName, propValue);
            break;

          case "string":
            propValue = "";
            this.$set(this.timetableRows[i], propName, propValue);
            break;

          case "number":
            propValue = 0;
            this.$set(this.timetableRows[i], propName, propValue);

            break;
        }
      }
    }
  }

  addToSeek(
    currentRowIndex: number,
    arrayName: string,
    next: string | string[],
    numeric: boolean
  ) {
    // globalID++;

    this.timetableRows[currentRowIndex][arrayName].forEach((letter, i) => {
      letterSeekArray.push({
        currentRowIndex,
        letterIndex: i,
        currentChar: letter,
        finalChar: next[i] ? next[i] : numeric ? "0" : " ",
        arrayName,
        numeric,
        id: ++globalID,
      });
    });
  }

  get stationInfo(): Station | null {
    if (!this.$route.query.station) return null;

    const station = this.stationList.find(
      (station) => station.stationHash === this.$route.query.station
    );

    return station || null;
  }

  updateRows(info: Station | null = this.stationInfo) {
    if (!info) return;
    if (info.scheduledTrains.length == 0) return;

    console.log("update");

    const scheduledTrains = info.scheduledTrains
      .filter((train) => {
        if (train.stopInfo.departureTimestamp == 0) return false;

        if (this.options.excludeCargo.state) {
          if (train.trainNo.toString().length === 5) return true;
          return false;
        }

        // if (!this.options.excludeCargo.state) return true;

        // const trainNumberLength = train.trainNo.toString().length;

        // if (trainNumberLength === 4 || trainNumberLength === 5) return true;

        return true;
      })
      .sort((a, b) => {
        if (a.stopInfo.departureTimestamp >= b.stopInfo.departureTimestamp)
          return 1;

        return -1;
      });

    let currentRowIndex = 0;
    for (let train of scheduledTrains) {
      if (train.stopInfo.confirmed) continue;
      if (currentRowIndex > this.maxRows - 1) break;

      const currentRow = this.timetableRows[currentRowIndex];

      const departureHours = new Array(2)
        .fill("0")
        .map((num, i) => train.stopInfo.departureTimeString[i]);

      const departureMinutes = new Array(2)
        .fill("0")
        .map((num, i) => train.stopInfo.departureTimeString[i + 3]);

      const trainNumberString = train.trainNo.toString();

      let destination = train.terminatesAt.toUpperCase();
      let nearestStop = train.nearestStop.toUpperCase();

      for (let name of filteredNames) {
        if (name[0] === destination) destination = name[1];

        if (name[0] === nearestStop) nearestStop = name[1];
      }

      if (currentRow.destinationString !== destination) {
        console.log(destination);

        this.addToSeek(currentRowIndex, "destinationTable", destination, false);
      }

      if (currentRow.nearestStopString !== nearestStop) {
        this.addToSeek(currentRowIndex, "nearestStopTable", nearestStop, false);
      }

      if (currentRow.departureHoursString != departureHours.toString()) {
        this.addToSeek(
          currentRowIndex,
          "departureHoursTable",
          departureHours,
          true
        );
      }

      if (currentRow.departureMinutesString != departureMinutes.toString()) {
        this.addToSeek(
          currentRowIndex,
          "departureMinutesTable",
          departureMinutes,
          true
        );
      }

      if (currentRow.trainNumberString != train.trainNo.toString()) {
        this.addToSeek(
          currentRowIndex,
          "trainNumberTable",
          trainNumberString,
          true
        );
      }

      if (currentRow.trainCategoryString != train.category) {
        this.addToSeek(
          currentRowIndex,
          "trainCategoryTable",
          train.category,
          false
        );
      }

      if (currentRow.delayPlate != currentRow.delay.toString()) {
        plateSeekArray.push({
          currentRowIndex,
          currentPlate: currentRow.delayPlate,
          wantedPlate: currentRow.delay > 0 ? currentRow.delay.toString() : "",
        });
      }

      currentRow.destinationString = destination;
      currentRow.nearestStopString = nearestStop;

      currentRow.category = train.category;
      currentRow.number = train.trainNo;

      currentRow.departureHoursString = departureHours.toString();
      currentRow.departureMinutesString = departureMinutes.toString();

      currentRow.trainNumberString = trainNumberString;
      currentRow.trainCategoryString = train.category;

      currentRow.arrivalTimestamp = train.stopInfo.arrivalTimestamp;
      currentRow.departureTimestamp = train.stopInfo.departureTimestamp;

      currentRow.delay =
        train.stopInfo.arrivalDelay >= 0 ? train.stopInfo.arrivalDelay : 0;

      currentRowIndex++;
    }

    this.resetTimetable(currentRowIndex);
  }

  get computedRows(): TimetableRow[] {
    this.updateRows();

    return this.timetableRows;
  }

  seekMainLetters() {
    if (letterSeekArray.length == 0) return;

    for (let i = 0; i < letterSeekArray.length; i++) {
      const wanted = letterSeekArray[i];

      const currentSet = wanted.numeric ? numberSet : letterSet;

      if (wanted.currentChar === wanted.finalChar) {
        letterSeekArray = letterSeekArray.filter(
          (letter) => letter.id !== wanted.id
        );

        continue;
      }

      const currentIndex = currentSet.findIndex(
        (char) => char === wanted.currentChar
      );
      const nextIndex =
        currentIndex == currentSet.length - 1 ? 0 : currentIndex + 1;
      const nextChar = currentSet[nextIndex];

      this.$set(
        this.timetableRows[wanted.currentRowIndex][wanted.arrayName],
        wanted.letterIndex,
        currentSet[nextIndex]
      );

      if (nextChar === wanted.finalChar) {
        letterSeekArray = letterSeekArray.filter(
          (letter) => letter.id !== wanted.id
        );

        continue;
      }

      letterSeekArray[i].currentChar = nextChar;
    }
  }

  seekDelayPlate() {
    if (plateSeekArray.length == 0) return;

    for (let i = 0; i < plateSeekArray.length; i++) {
      const plate = plateSeekArray[i];

      if (plate.currentPlate === plate.wantedPlate) {
        plateSeekArray = plateSeekArray.filter(
          (p) => plate.currentRowIndex === p.currentRowIndex
        );

        continue;
      }

      const currentIndex = delaySet.findIndex((p) => p === plate.currentPlate);

      const nextIndex =
        currentIndex == delaySet.length - 1 ? 0 : currentIndex + 1;

      const nextPlate = delaySet[nextIndex];

      this.timetableRows[plate.currentRowIndex].delayPlate =
        delaySet[nextIndex];

      if (nextPlate === plate.wantedPlate) {
        plateSeekArray = plateSeekArray.filter(
          (p) => plate.currentRowIndex === p.currentRowIndex
        );

        continue;
      }
    }
  }

  findNextLetters(time) {
    if (time > nextRefreshTime) {
      this.seekMainLetters();
      // this.seekDelayPlate();
      // this.seekSideLetters(time);

      nextRefreshTime = time + 140;
    }

    // console.log(
    //   letterSeekArray.length < 10 ? letterSeekArray : letterSeekArray.length
    // );

    if (this.options.playSounds.state) {
      if (letterSeekArray.length > 0 && !soundPlaying) {
        sound.play();
        soundPlaying = true;
      } else if (letterSeekArray.length == 0) {
        setTimeout(() => {
          sound.stop();
          soundPlaying = false;
        }, 200);
      }
    } else {
      sound.stop();
      soundPlaying = false;
    }

    requestAnimationFrame(this.findNextLetters);
  }
}
</script>

<style lang="scss" scoped>
$bg: #111;

.timetable-view {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 3rem;
}

.timetable-wrapper {
  width: 1500px;
  min-width: 1500px;

  padding: 0.5rem;

  background: $bg;
}

.timetable-options {
  margin-bottom: 0.5rem;

  width: 100%;

  font-size: 0.4em;

  display: flex;
}

.option {
  position: relative;

  cursor: pointer;
  -moz-user-select: none;
  -webkit-user-select: none;

  margin: 0.3em;
  padding: 0.35em 0.7em;
  border-radius: 0.4em;

  transition: all 0.2s ease-in;

  &:not(.checked) {
    background-color: #585858;

    &::before {
      box-shadow: none;
    }
  }

  &.checked {
    background-color: #05b702;

    &::before {
      box-shadow: 0 0 6px 1px #05b702;
    }
  }

  &::before {
    position: absolute;
    content: "";
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    border-radius: inherit;
    transition: inherit;
  }
}

.timetable {
  &-title {
    text-align: center;

    padding: 0.5rem 0;
  }

  &-header,
  &-row {
    display: grid;
    grid-template-columns: 4fr 4fr 3fr 1fr 1fr;
  }

  &-header {
    span {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    text-align: center;
    font-size: 0.35em;

    margin-bottom: 0.5rem;
  }

  &-row {
    width: 100%;

    font-size: 0.4em;
    margin-top: 0.5rem;

    span {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

.letter {
  border: 1px solid gray;
  width: 25px;
  height: 30px;

  margin: 0 2px;

  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
}

.letter-wrapper {
  display: flex;
}

.row {
  &-bar {
    width: 100%;
    height: 3px;
    background: white;

    margin-top: 0.5rem;
  }

  &-type {
    text-align: center;

    div {
      margin: 0 0.5em;
    }

    // span {
    //   display: inline-block;
    //   width: 60%;
    //   min-height: 40px;
    //   line-height: 40px;
    // }
  }

  &-delay {
    text-align: center;

    span {
      display: inline-block;
      width: 70%;
      min-height: 40px;
      line-height: 40px;

      background: #444;
    }
  }
}

.type {
  &-category {
    background: red;
  }
}

.roll-anim-enter-active,
.roll-anim-leave-active {
  transition: transform 70ms;
  will-change: transform;

  // opacity: 0;
}
.roll-anim-enter,
.roll-anim-leave-to {
  transform: rotate3d(1, 0, 0, -90deg);
  // opacity: 0;
}
</style>