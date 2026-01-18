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
  });

  return {
    canonicalString, signature: signature.toString("base64")
  };
}

export function verifyRSASign(message, publicKey, signature) {
  return crypto.verify(
    "sha256",
    Buffer.from(message, "utf8"), {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  },
    Buffer.from(signature, "base64")
  );
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



