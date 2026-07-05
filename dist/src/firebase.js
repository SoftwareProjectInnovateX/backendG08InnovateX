"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: "AIzaSyC64IrEovMCJi6mNKMAb4WPNDKGeubsuVM",
    authDomain: "supplier-management-70b81.firebaseapp.com",
    projectId: "supplier-management-70b81",
    storageBucket: "supplier-management-70b81.firebasestorage.app",
    messagingSenderId: "109245280482",
    appId: "1:109245280482:web:d0c1df43c6628fd5f36ebb",
    measurementId: "G-NLMV8D63XD"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
//# sourceMappingURL=firebase.js.map