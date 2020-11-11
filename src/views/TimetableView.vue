<template>
  <div class="timetable-view" v-if="stationInfo">
    <div class="timetable-wrapper">
      <div class="timetable-title"><b>ODJAZDY</b></div>
      <div class="timetable-header">
        <span>DO STACJI</span>
        <span>PRZEZ</span>
        <span>POCIĄG</span>
        <span>PLAN. ODJAZD</span>
        <span>OPÓŹNIENIE</span>
      </div>
      <div class="timetable-body">
        <div
          class="timetable-item"
          v-for="(timetable, i) in computedRows"
          :key="i"
        >
          <div class="row-bar"></div>
          <div class="timetable-row">
            <span class="row-destination">
              <div class="letter-wrapper">
                <div
                  v-for="(letter, j) in timetable.destinationTable"
                  :key="j"
                  class="letter"
                >
                  <transition name="roll-anim" mode="out-in">
                    <span :key="letter">{{ letter }}</span>
                  </transition>
                </div>
              </div>
            </span>
            <span class="row-next" ref="next">
              <div
                v-for="(letter, j) in timetable.nearestStopTable"
                :key="j"
                class="letter"
              >
                <transition name="roll-anim" mode="out-in">
                  <span :key="letter">{{ letter }}</span>
                </transition>
              </div>
            </span>
            <span class="row-type">
              <transition name="roll-anim" mode="out-in">
                <span :key="timetable.number">
                  {{
                    timetable.number
                      ? `${timetable.category} ${timetable.number}`
                      : ""
                  }}
                </span>
              </transition>
            </span>
            <span class="row-time">
              <div class="letter-wrapper">
                <span
                  class="letter"
                  v-for="(num, i) in timetable.departureHoursTable"
                  :key="i"
                >
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
                <span :key="timetable.delay">
                  {{ timetable.delay > 0 ? `${timetable.delay} min` : "" }}
                </span>
              </transition>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- <div v-if="stationInfo.online">
      {{ stationInfo.stationName }}
    </div>
    <div v-else>Stacja offline!</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from "vuex-class";
import { Howl } from "howler";

import Station from "@/scripts/interfaces/Station";
import Timetable from "@/scripts/interfaces/Timetable";


const sound = new Howl({
  src: require("@/assets/sound.wav"),
  loop: true,
  autoplay: false
});

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
]

let soundPlaying = false;

const letterSet: string[] = Array.from(" -.,/AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWXYZŹŻ");
const numberSet: string[] = Array.from(" 0123456789");

let letterSeekArray: {
  currentRowIndex: number;
  letterIndex: number;
  currentChar: string;
  finalChar: string;
  main: boolean;
  numeric: boolean;
  id: number;
}[] = [];

let globalID = 0;


let numberSeekArray: {
  currentRowIndex: number;
  letterIndex: number;
  currentChar: string;
  finalChar: string;
}[] = [];


let nextRefreshTime = 0;

@Component
export default class TimetableView extends Vue {
  @Getter('getStationList') stationList!: Station[];

  get stationInfo(): Station | null {
    if (!this.$route.query.station) return null;

    const info = this.stationList.find(station => station.stationName === this.$route.query.station.toString().replaceAll("_", " "));

    return info || null;
  }

  timetableRows: {
    destinationTable: string[];
    destinationString: string;

    nearestStopTable: string[];
    nearestStopString: string;

    departureHoursTable: string[];
    departureHoursString: string;

    departureMinutesTable: string[];
    departureMinutesString: string;

    category: string;
    number: number;
    delay: number;
    departureTimestamp: number;
    arrivalTimestamp: number;

  }[] = [];

  deactivated() {
    for (let i = 0; i < this.timetableRows.length; i++) {
      const currentRow = this.timetableRows[i];

      currentRow.destinationTable = currentRow.destinationTable.map(v => " ");
      currentRow.nearestStopTable = currentRow.nearestStopTable.map(v => " ");
      currentRow.departureHoursTable = currentRow.departureHoursTable.map(v => "0");
      currentRow.departureMinutesTable = currentRow.departureMinutesTable.map(v => "0");

      currentRow.destinationString = "";
      currentRow.nearestStopString = "";
      currentRow.departureHoursString = "";
      currentRow.departureMinutesString = "";

      currentRow.category = "";
      currentRow.number = 0;
      currentRow.arrivalTimestamp = 0;
      currentRow.departureTimestamp = 0;
      currentRow.delay = 0;
    }

    letterSeekArray.length = 0;

  }

  mounted() {
    this.timetableRows = new Array(8).fill(0).map(row => ({
      origin: new Array(13).fill(" "),

      destinationTable: new Array(13).fill(" "),
      destinationString: "",

      nearestStopTable: new Array(13).fill(" "),
      nearestStopString: "",

      departureHoursTable: new Array(2).fill("0"),
      departureHoursString: "",

      departureMinutesTable: new Array(2).fill("0"),
      departureMinutesString: "",
      category: "",
      number: 0,
      delay: 0,
      departureTimestamp: 0,
      arrivalTimestamp: 0,
    }));

    window.requestAnimationFrame(this.findNextLetters);
  }


  get computedRows(): any[] {
    if (!this.stationInfo) return this.timetableRows;

    const scheduledTrains = this.stationInfo.scheduledTrains.filter(train => train.stopInfo.departureTimestamp !== 0).sort((a, b) => {
      if (a.stopInfo.departureTimestamp >= b.stopInfo.departureTimestamp) return 1;
      else return -1;
    });

    let currentRowIndex = 0;
    for (let train of scheduledTrains) {
      if (train.stopInfo.confirmed) continue;
      if (currentRowIndex > this.timetableRows.length - 1) break;

      const currentRow = this.timetableRows[currentRowIndex];

      const departureHours = new Array(2).fill("0").map((num, i) => train.stopInfo.departureTimeString[i]);
      const departureMinutes = new Array(2).fill("0").map((num, i) => train.stopInfo.departureTimeString[i + 3]);

      let destination = train.terminatesAt.toUpperCase();
      let nearestStop = train.nearestStop.toUpperCase();




      for (let name of filteredNames) {
        if (name[0] === destination)
          destination = name[1];

        if (name[0] === nearestStop)
          nearestStop = name[1];
      }

      if (currentRow.destinationString !== destination) {
        currentRow.destinationTable.forEach((letter, i) => {
          letterSeekArray.push({
            currentRowIndex,
            letterIndex: i,
            currentChar: (currentRow.destinationString.length == 0 && letter != " ") ? letterSet[Math.floor(Math.random() * letterSet.length)] : letter,
            finalChar: destination[i] ? destination[i].toUpperCase() : " ",
            main: true,
            numeric: false,
            id: globalID
          })

          globalID++;

        })
      }

      if (currentRow.nearestStopString !== nearestStop) {

        currentRow.nearestStopTable.forEach((letter, i) => {
          letterSeekArray.push({
            currentRowIndex,
            letterIndex: i,
            currentChar: (currentRow.nearestStopString.length == 0 && letter != " ") ? letterSet[Math.random() * letterSet.length] : letter,
            finalChar: nearestStop[i] ? nearestStop[i].toUpperCase() : " ",
            main: false,
            numeric: false,
            id: globalID
          })

          globalID++;

        })
      }

      if (currentRow.departureHoursTable.toString() != departureHours.toString()) {
        currentRow.departureHoursTable.forEach((num, i) => {
          letterSeekArray.push({
            currentRowIndex,
            letterIndex: i,
            currentChar: num,
            finalChar: departureHours[i] ? departureHours[i] : "0",
            main: true,
            numeric: true,
            id: globalID
          })

          globalID++;

        })
      }

      if (currentRow.departureMinutesString != departureMinutes.toString()) {
        currentRow.departureMinutesTable.forEach((num, i) => {
          letterSeekArray.push({
            currentRowIndex,
            letterIndex: i,
            currentChar: num,
            finalChar: departureMinutes[i] ? departureMinutes[i] : "0",
            main: false,
            numeric: true,
            id: globalID
          })

          globalID++;
        })

      }


      currentRow.destinationString = destination;
      currentRow.nearestStopString = nearestStop;

      // currentRow.nearestStop = currentRow.nearestStop.map((letter, i) => train.nearestStop[i] ? train.nearestStop[i].toUpperCase() : " ");
      currentRow.category = train.category;
      currentRow.number = train.trainNo;

      currentRow.departureMinutesString = departureMinutes.toString();
      currentRow.departureMinutesString = departureMinutes.toString();

      // currentRow.departureHours = departureHours;
      // currentRow.departureMinutes = departureMinutes;
      currentRow.arrivalTimestamp = train.stopInfo.arrivalTimestamp;
      currentRow.departureTimestamp = train.stopInfo.departureTimestamp;
      currentRow.delay = train.stopInfo.arrivalDelay >= 0 ? train.stopInfo.arrivalDelay : 0;

      currentRowIndex++;
    }

    for (let i = currentRowIndex; i < this.timetableRows.length; i++) {
      const currentRow = this.timetableRows[i];

      currentRow.destinationTable = currentRow.destinationTable.map(v => " ");
      currentRow.nearestStopTable = currentRow.nearestStopTable.map(v => " ");
      currentRow.departureHoursTable = currentRow.departureHoursTable.map(v => "0");
      currentRow.departureMinutesTable = currentRow.departureMinutesTable.map(v => "0");

      currentRow.destinationString = "";
      currentRow.nearestStopString = "";
      currentRow.departureHoursString = "";
      currentRow.departureMinutesString = "";

      currentRow.category = "";
      currentRow.number = 0;
      currentRow.arrivalTimestamp = 0;
      currentRow.departureTimestamp = 0;
      currentRow.delay = 0;
    }

    return this.timetableRows;
  }

  seekMainLetters(time) {
    if (time > nextRefreshTime) {
      for (let i = 0; i < letterSeekArray.length; i++) {
        const wanted = letterSeekArray[i];
        const currentSet = wanted.numeric ? numberSet : letterSet;

        if (wanted.currentChar === wanted.finalChar) {
          letterSeekArray = letterSeekArray.filter(letter => letter.id !== wanted.id);
          continue;
        }

        const currentIndex = currentSet.findIndex(char => char === wanted.currentChar);
        const nextIndex = currentIndex == currentSet.length - 1 ? 0 : currentIndex + 1;
        const nextChar = currentSet[nextIndex];

        if (!wanted.numeric) {
          this.$set(
            wanted.main ? this.timetableRows[wanted.currentRowIndex].destinationTable : this.timetableRows[wanted.currentRowIndex].nearestStopTable,
            wanted.letterIndex,
            currentSet[nextIndex]);
        } else {
          this.$set(wanted.main ? this.timetableRows[wanted.currentRowIndex].departureHoursTable : this.timetableRows[wanted.currentRowIndex].departureMinutesTable,
            wanted.letterIndex,
            nextChar);


        }
        // this.timetableRows[wanted.currentRowIndex].departureMinutes[wanted.letterIndex] = currentSet[nextIndex];

        if (nextChar === wanted.finalChar) {
          letterSeekArray = letterSeekArray.filter(letter => letter.id !== wanted.id);
          continue;
        }

        letterSeekArray[i].currentChar = nextChar;
      }

    }
  }



  findNextLetters(time) {
    if (time > nextRefreshTime) {
      this.seekMainLetters(time);
      // this.seekSideLetters(time);

      nextRefreshTime = time + 100;
    }


    if (letterSeekArray.length > 0 && !soundPlaying) { sound.play(); soundPlaying = true; }
    else if (letterSeekArray.length == 0) {
      setTimeout(() => {
        sound.stop(); soundPlaying = false;
      }, 200);
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

.timetable {
  &-title {
    text-align: center;

    padding: 0.5rem 0;
  }

  &-header,
  &-row {
    display: grid;
    grid-template-columns: 4fr 4fr 2fr 1fr 1fr;
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

.row-bar {
  width: 100%;
  height: 3px;
  background: white;

  margin-top: 0.5rem;
}

.row {
  &-type {
    text-align: center;

    span {
      display: inline-block;
      width: 60%;
      min-height: 40px;
      line-height: 40px;

      background: firebrick;
    }
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

.roll-anim-enter-active,
.roll-anim-leave-active {
  transition: all 75ms;
  // opacity: 0;
}
.roll-anim-enter, .roll-anim-leave-to /* .list-leave-active below version 2.1.8 */ {
  transform: rotateX(-90deg);
  perspective: 600px;
}
</style>