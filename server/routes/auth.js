// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email only
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password." });

    const user = result.rows[0];

    // compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      message: "Login successful!",
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK EMAIL (for forgot password)
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT security_question FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "No account found with this email." });
    res.json({ question: result.rows[0].security_question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY RECOVERY (security question or backup key)
router.post('/verify-recovery', async (req, res) => {
  try {
    const { email, type, answer, backupKey } = req.body;
    const result = await pool.query('SELECT security_answer, backup_key FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const user = result.rows[0];
    if (type === 'question') {
      if (user.security_answer.toLowerCase() !== answer.toLowerCase())
        return res.status(401).json({ error: "Incorrect security answer." });
    } else if (type === 'key') {
      if (user.backup_key !== backupKey.toUpperCase())
        return res.status(401).json({ error: "Invalid Backup Key." });
    }
    res.json({ message: "Verification successful." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET PASSWORD (after recovery)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PASSWORD (while logged in)
router.put('/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // fetch current hashed password
    const result = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const currentHash = result.rows[0].password;

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect current password." });

    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;