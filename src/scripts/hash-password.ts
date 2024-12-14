import bcrypt from "bcryptjs";

async function hashPassword() {
  const plainPassword = "admin@123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed Password:", hashedPassword);
}

hashPassword();
