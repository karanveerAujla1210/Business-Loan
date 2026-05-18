/**
 * One-time script to set a password for a staff member.
 * Usage: node scripts/set-staff-password.js <EmployeeID> <password>
 * Example: node scripts/set-staff-password.js EMP001 MySecret@123
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const Employees = require("../src/models/staffModal");

const [, , employeeId, plainPassword] = process.argv;

if (!employeeId || !plainPassword) {
  console.error("Usage: node scripts/set-staff-password.js <EmployeeID> <password>");
  process.exit(1);
}

(async () => {
  try {
    const staff = await Employees.findOne({ where: { EmployeeID: employeeId } });
    if (!staff) {
      console.error(`No staff found with EmployeeID: ${employeeId}`);
      process.exit(1);
    }
    const hashed = await bcrypt.hash(plainPassword, 10);
    await Employees.update({ password: hashed }, { where: { EmployeeID: employeeId } });
    console.log(`✅ Password set successfully for ${employeeId} (${staff.name})`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
