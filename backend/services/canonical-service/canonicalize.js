import crypto from "crypto";

export function canonicalize(studentdata) {
  let canonicalString = "";

  canonicalString = Object.values(studentdata).map(value =>
    String(value).trim().toLowerCase()).join("|")

  return canonicalString;
}
//function for regular sha256 hashing
function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashCanonicalString(canonicalString) {
  return sha256(canonicalString)
}



/*
Test inputs provided in payload.json

 input = {
  university,
  studentName,
  degree,
  degreeAwardedDate,
  hiddenIdentifier
 }
 */



