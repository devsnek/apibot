const child_process = require('child_process');

function exec(...args) {
  return new Promise((resolve, reject) => {
    child_process.exec(...args, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout, stderr });
    });
  });
}

module.exports = exec;
