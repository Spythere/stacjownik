import * as firebase from "firebase/app";
import "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBI36X2-p7vU1flxoJdCEc0noByyTe1mpw",
  authDomain: "stacjownik-td2.firebaseapp.com",
  databaseURL: "https://stacjownik-td2.firebaseio.com",
  projectId: "stacjownik-td2",
});

export default firebase.firestore();
