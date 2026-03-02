import crypto from "crypto";

//define order for fields
const FIELD_ORDER = ["university",
  "studentName",
  "degree",
  "degreeAwardedDate", //YYYY-MM-DD
  "hiddenIdentifier"];

const DELIMITER = "|";

//function to check if any fields are missing
function rejectIfMissing(value, field) {
  if (value === null || value === undefined) {
    throw new Error(`Missing required field "${field}"`);
  }
}


function checkForDelimiter(value, field) {
  if (value.includes(DELIMITER)) {
    throw new Error(`Field "${field}" contains the delimeter "${DELIMITER}"`)
  }
}


function normalizeString(value, field) {
  rejectIfMissing(value, field)

  if (typeof value != "string") {
    throw new Error(`Field "${field}" must be a string`);
  }

  const input = value.normalize("NFKC").trim().toLowerCase();
  checkForDelimiter(input, field);
  if (input.length === 0 || null || undefined) {
    throw new Error(`Field "${field}" cannot be empty`);
  }

  return input;

}

function checkISODate(value, field) {

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be in ISO-8601 format YYYY-MM-DD`);
  }

  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));

  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() + 1 !== m ||
    dt.getUTCDate() !== d
  ) {
    throw new Error(`${field} is not a valid calendar date`);
  }

  return value;
}


export function canonicalize(studentdata) {

  if (studentdata === null || typeof studentdata !== "object") {
    throw new Error("student data must be an object");
  }

  let canonicalString = FIELD_ORDER.map((field) => {
    const check = studentdata[field];

    if (field === "degreeAwardedDate") return checkISODate(check, field);

    return normalizeString(check, field)
  })

  return canonicalString.join(DELIMITER)

}

//function for regular sha256 hashing
function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashCanonicalString(canonicalString) {
  return sha256(canonicalString)
}


//Create public and private keys using rsa
export const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 4096 })

console.log(privateKey.export({ type: 'pkcs8', format: "pem" }));
console.log(publicKey.export({ type: "spki", format: "pem" }));

export function signStudentRecord(hash, privateKey) {

  let signature = crypto.sign("sha256", Buffer.from(hash, "utf8"), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  });

  return {
    hash, signature: signature.toString("base64")
  };
}

export function verifyRSASign(message, publicKey, signature) {
  return crypto.verify(
    "sha256",
    Buffer.from(message, "utf8"), {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
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



