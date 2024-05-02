const cron = require('node-cron');
const { spawn } = require('child_process');

// Function to run M5.js and log its output
function runM5Script() {
  console.log('Executing M5.js...');
  const m5Process = spawn('node', ['./M5.js'], { stdio: 'inherit' });

  m5Process.on('close', (code) => {
    console.log('M5.js exited with code', code);
    if (code === 0) {
      console.log('Data successfully sent to /response. Terminating Cron job.');
      process.exit();
      
    }
  });
}

// Schedule Cron job to run M5.js every 5 minutes
cron.schedule('*/5 * * * *', () => {
  runM5Script();
});

// Logs the initialization of the Cron job
console.log('Cron Job for M5 initialized. M5.js will be executed every 5 minutes.');
