import crypto from "crypto";

export function canonicalize(studentdata) {
  let canonicalString = "";

  canonicalString = Object.values(studentdata).map(value =>
    String(value).trim().toLowerCase()).join("|")

  return canonicalString;
}
//--------Function No Longer Needded Due to Signature-------------
export function hashCanonicalString(canonicalString) {
  return sha256(canonicalString)
}
//---------------------------------------------------------------

//Create public and private keys using rsa
export const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 4096 })

console.log(privateKey.export({ type: 'pkcs8', format: "pem" }));
console.log(publicKey.export({ type: "spki", format: "pem" }));

export function signStudentRecord(canonicalString, privateKey) {

  let signature = crypto.sign("sha256", Buffer.from(canonicalString, "utf8"), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  });

  return {
    canonicalString, signature: signature.toString("base64")
  };
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



