import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

import axios from "axios";

exports.scheduledUpdate = functions.pubsub
  .schedule("0 * * * *")
  .onRun(async (context) => {
    let stationData: {
      stationName: string;
      dispatcherName: string;
      isOnline: boolean;
      region: string;
    }[];

    try {
      stationData = await (
        await axios.get(
          "https://api.td2.info.pl:9640/?method=getStationsOnline"
        )
      ).data.message;
    } catch (error) {
      return;
    }

    const historyRef = db.collection("history");

    stationData.forEach(async (station) => {
      const docRef = historyRef.doc(station.stationName);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        docRef.set({
          occupiedFrom: Date.now(),
          currentDispatcherName: station.dispatcherName,
        });
        return;
      }
    });

    const snapshot = await historyRef.get();

    snapshot.forEach(async (doc) => {
      const docData = doc.data();
      const docRef = historyRef.doc(doc.id);

      const APIStationData = stationData
        .filter((station) => station.isOnline && station.region === "eu")
        .find((station) => station.stationName == doc.id);

      if (docData.currentDispatcherName != "") {
        if (
          !APIStationData ||
          APIStationData.dispatcherName != docData.currentDispatcherName
        ) {
          docRef.update({
            currentDispatcherName: !APIStationData
              ? ""
              : APIStationData.dispatcherName,
            occupiedFrom: !APIStationData ? 0 : Date.now(),
          });

          docRef.collection("dispatcherHistory").add({
            currentDispatcherName: docData.currentDispatcherName,
            occupiedFrom: docData.occupiedFrom,
            occupiedTo: Date.now(),
          });
        }
      } else if (APIStationData) {
        docRef.update({
          currentDispatcherName: APIStationData.dispatcherName,
          occupiedFrom: Date.now(),
        });
      }
    });
  });
