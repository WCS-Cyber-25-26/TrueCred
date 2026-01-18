//Currently established as app.js, will be changed to server.js in Phase 2

import { canonicalize, hashCanonicalString, signStudentRecord, privateKey, publicKey, verifyRSASign } from './canonicalize.js';

function processStudentRecords() {
    //add more student data if needed from payload.json
    const studentRecords = [
        {
            university: "Western University",
            studentName: "Alice Johnson",
            degree: "Bachelor of Science",
            degreeAwardedDate: "2024-06-12",
            hiddenIdentifier: "X9F2K-8821",
        },
        {
            university: "University of Toronto",
            studentName: "Mohammed Ali",
            degree: "Master of Engineering",
            degreeAwardedDate: "2023-11-01",
            hiddenIdentifier: "UTM-ENG-99341",
        },
    ];

    for (const studentData of studentRecords) {
        const canonicalString = canonicalize(studentData);
        const hash = hashCanonicalString(canonicalString);
        const signedHash = signStudentRecord(hash, privateKey);
        const verify = verifyRSASign(signedHash.hash, publicKey, signedHash.signature)

        console.log("Canonical String:");
        console.log(canonicalString);

        console.log("SHA-256 Hash:");
        console.log(hash);

        console.log("Hashed Signature: ")
        console.log(signedHash);

        console.log("Verification of Signature: ")
        console.log(verify)
    }
}

processStudentRecords();

//to run, execture node app.js in the canonical-service directory