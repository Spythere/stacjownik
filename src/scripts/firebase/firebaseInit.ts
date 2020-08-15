import * as firebase from "firebase/app";
import "firebase/firestore";

require("dotenv").config();

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: "stacjownik-td2.firebaseapp.com",
  databaseURL: "https://stacjownik-td2.firebaseio.com",
  projectId: "stacjownik-td2",
});

export default firebase.firestore();
