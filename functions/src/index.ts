import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
// const db = admin.firestore();

import axios from "axios";

import stationJSONList from "./stations.json";

let stationAPIData: {
  stationName: string;
  dispatcherName: string;
  isOnline: boolean;
  region: string;
}[] = [];

let previousOnlineStations: {
  stationName: string;
  dispatcherName: string;
  occupiedFrom: number;
}[] = [];

const API_URL = "https://api.td2.info.pl:9640/?method=getStationsOnline";

exports.updateHistory = functions.pubsub
  .schedule("*/5 * * * *")
  .onRun(async () => {
    try {
      stationAPIData = await (await axios.get(API_URL)).data.message;
    } catch (error) {
      return;
    }

    // On server start
    if (previousOnlineStations.length == 0) {
      stationAPIData
        .filter(
          (station) =>
            station.isOnline &&
            station.region === "eu" &&
            stationJSONList.some(
              (data) => data.stationName === station.stationName
            )
        )
        .forEach((station) => {
          const occupiedFrom = Date.now();

          previousOnlineStations.push({
            stationName: station.stationName,
            dispatcherName: station.dispatcherName,
            occupiedFrom,
          });
        });

      return;
    }

    // When array with previous stations isn't empty
    previousOnlineStations.forEach((prevStation) => {
      const currStationData = stationAPIData.find(
        (currStation) => currStation.stationName === prevStation.stationName
      );

      // Dispatcher left
      if (!currStationData) {
        previousOnlineStations = previousOnlineStations.filter(
          (s) => s.stationName !== prevStation.stationName
        );
      }
      // Dispatchers switched
      else if (prevStation.dispatcherName !== currStationData.dispatcherName) {
        previousOnlineStations = previousOnlineStations.filter(
          (s) => s.stationName !== prevStation.stationName
        );

        previousOnlineStations.push({
          stationName: currStationData.stationName,
          dispatcherName: currStationData.dispatcherName,
          occupiedFrom: Date.now(),
        });
      }
    });

    stationAPIData
      .filter(
        (stationData) =>
          !previousOnlineStations.find(
            (prevStation) => prevStation.stationName === stationData.stationName
          )
      )
      .forEach((stationData) => {
        previousOnlineStations.push({
          stationName: stationData.stationName,
          dispatcherName: stationData.dispatcherName,
          occupiedFrom: Date.now(),
        });
      });
  });

exports.getHistoryData = functions.https.onCall((data, context) => {
  return { previousOnlineStations };
});

// // const scheduledUpdate = functions.pubsub
// //   .schedule("0 * * * *")
// //   .onRun(async (context) => {
// //     let stationData: {
// //       stationName: string;
// //       dispatcherName: string;
// //       isOnline: boolean;
// //       region: string;
// //     }[];

// //     try {
// //       stationData = await (
// //         await axios.get(
// //           "https://api.td2.info.pl:9640/?method=getStationsOnline"
// //         )
// //       ).data.message;
// //     } catch (error) {
// //       return;
// //     }

// //     const historyRef = db.collection("history");

// //     stationData.forEach(async (station) => {
// //       const docRef = historyRef.doc(station.stationName);
// //       const docSnapshot = await docRef.get();

// //       if (!docSnapshot.exists) {
// //         docRef.set({
// //           occupiedFrom: Date.now(),
// //           currentDispatcherName: station.dispatcherName,
// //         });
// //         return;
// //       }
// //     });

// //     const snapshot = await historyRef.get();

// //     snapshot.forEach(async (doc) => {
// //       const docData = doc.data();
// //       const docRef = historyRef.doc(doc.id);

// //       const APIStationData = stationData
// //         .filter((station) => station.isOnline && station.region === "eu")
// //         .find((station) => station.stationName == doc.id);

// //       if (docData.currentDispatcherName != "") {
// //         if (
// //           !APIStationData ||
// //           APIStationData.dispatcherName != docData.currentDispatcherName
// //         ) {
// //           docRef.update({
// //             currentDispatcherName: !APIStationData
// //               ? ""
// //               : APIStationData.dispatcherName,
// //             occupiedFrom: !APIStationData ? 0 : Date.now(),
// //           });

// //           docRef.collection("dispatcherHistory").add({
// //             currentDispatcherName: docData.currentDispatcherName,
// //             occupiedFrom: docData.occupiedFrom,
// //             occupiedTo: Date.now(),
// //           });
// //         }
// //       } else if (APIStationData) {
// //         docRef.update({
// //           currentDispatcherName: APIStationData.dispatcherName,
// //           occupiedFrom: Date.now(),
// //         });
// //       }
// //     });
// //   });
