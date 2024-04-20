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
cron.schedule('*/5 * * * *', () => {
  runMon2Script();
});

// Logs the initialization of the Cron job
console.log('Cron Job for MON-2 initialized. MON-2.js will be executed every 5 minutes.');
