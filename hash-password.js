const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('--- Password Hash Generator ---');
rl.question('Please enter the password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    rl.close();
    return;
  }
  
  bcrypt.hash(password, 1, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      console.log('\nPassword hashed successfully!');
      console.log('Hashed Password:', hash);
      console.log('\nYou can now copy this hash and insert it into the `password` column of your `users` table.');
    }
    rl.close();
  });
});