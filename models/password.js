import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();

  return await bcrypt.hash(password, rounds);
}

function getNumberOfRounds() {
  if (process.env.NODE_ENV === "production") {
    return 14;
  }

  return 1;
}

async function compare(providedPassword, storedPassword) {
  return await bcrypt.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
