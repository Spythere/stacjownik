// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// admin.initializeApp();
// const db = admin.firestore();

// import axios from "axios";

// const stationJSONList: any[] = require("./stations.json");

// let stationAPIData: {
//   stationName: string;
//   dispatcherName: string;
//   isOnline: boolean;
//   region: string;
// }[];

// let previousOnlineStations: {
//   stationName: string;
//   dispatcherName: string;
//   occupiedFrom: number;
// }[] = [];

// // const test = functions.pubsub.schedule("0 * * * *").onRun(async (context) => {
// //   try {
// //     stationAPIData = await (
// //       await axios.get("https://api.td2.info.pl:9640/?method=getStationsOnline")
// //     ).data.message;
// //   } catch (error) {
// //     return;
// //   }

// //   if (previousOnlineStations.length == 0) {
// //     const historyRef = db.collection("dispatcherHistory");

// //     stationAPIData
// //       .filter((station) => station.isOnline && station.region === "eu")
// //       .forEach(async (station) => {
// //         const isOfficial: boolean = stationJSONList.some(
// //           (stationData) => stationData.stationName === station.stationName
// //         );

// //         if (!isOfficial) return;

// //         const docRef = historyRef.doc(station.stationName);
// //         const docSnap = await docRef.get();

// //         const occupiedFrom = Date.now();

// //         if (!docSnap.exists) {
// //           docRef.set({
// //             occupiedFrom,
// //             currentDispatcherName: station.dispatcherName,
// //           });
// //         } else {
// //           docRef.update({
// //             occupiedFrom,
// //             currentDispatcherName: station.dispatcherName,
// //           });
// //         }

// //         previousOnlineStations.push({
// //           dispatcherName: station.dispatcherName,
// //           occupiedFrom,
// //           stationName: station.stationName,
// //         });
// //       });
// //   } else {
// //     previousOnlineStations.forEach((prevStation) => {
// //       const currStationData = stationAPIData.find(
// //         (currStation) => currStation.stationName === prevStation.stationName
// //       );

// //       // Dispatcher left
// //       if (!currStationData) {
// //       }
// //       // The same dispatcher is still online - do nothing
// //       else if (prevStation.dispatcherName === currStationData.dispatcherName) {
// //       }
// //       // Dispatchers switched
// //       else if (prevStation.dispatcherName !== currStationData.dispatcherName) {
// //       }
// //     });

// //     stationAPIData.forEach((stationData) => {
// //       const isPrevious = previousOnlineStations.find(
// //         (prevStation) => prevStation.stationName === stationData.stationName
// //       );

// //       // New station turned online
// //       if (!isPrevious) {
// //       }
// //     });
// //   }
// // });

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
