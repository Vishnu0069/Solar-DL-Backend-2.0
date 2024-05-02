const cron = require('node-cron');
const { spawn } = require('child_process');

// Function to run MON-2.js and log its output
function runMon2Script() {
  console.log('Executing MON-2.js...');
  const mon2Process = spawn('node', ['./MON-2.js'], { stdio: 'inherit' });

  mon2Process.on('close', (code) => {
    console.log('MON-2.js exited with code', code);
    if (code === 0) {
      console.log('Data successfully sent to /request. Terminating Cron job.');
      process.exit(); // Terminate the current process
    }
  });
}

// Schedule Cron job to run MON-2.js every 5 minutes
cron.schedule('/15 * * * *', () => {
  runMon2Script();
});

// Logs the initialization of the Cron job
console.log('Cron Job for MON-2 initialized. MON-2.js will be executed every 5 minutes.');

/*const cron = require('node-cron');
const { spawn } = require('child_process');

// Function to run MON-2.js and log its output
function runMon2Script() {
  console.log('Executing MON-2.js...');
  const mon2Process = spawn('node', ['./MON-2.js'], { stdio: 'inherit' });

  mon2Process.on('close', (code) => {
    console.log('MON-2.js exited with code', code);
    if (code === 0) {
      console.log('Data successfully sent to /request.');
    }
  });
}

// Function to run M5.js and log its output
function runM5Script() {
  console.log('Waiting for 15 minutes before executing M5.js...');
  setTimeout(() => {
    console.log('Executing M5.js...');
    const m5Process = spawn('node', ['./M5.js'], { stdio: 'inherit' });

    m5Process.on('close', (code) => {
      console.log('M5.js exited with code', code);
      if (code === 0) {
        console.log('M5.js execution completed.');
      }
    });
  }, 900000); // 15 minutes in milliseconds
}

// Run MON-2.js as soon as the cron job starts
runMon2Script();

// Schedule Cron job to run M5.js every 15 minutes
cron.schedule('/15 * * * *', () => {
  runM5Script();
});

// Logs the initialization of the Cron job
console.log('Cron Job for MON-2 initialized. MON-2.js will be executed immediately and M5.js will be executed every 15 minutes after a delay of 15 minutes.');
*/
