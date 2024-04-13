const { spawn } = require('child_process');
const cron = require('node-cron');

// Function to run a script file
const runScript = (scriptPath) => {
  console.log(`Starting ${scriptPath}...`);
  const process = spawn('node', [scriptPath], { stdio: 'inherit' });

  process.on('close', (code) => {
    console.log(`${scriptPath} exited with code ${code}`);
  });
};

// Cron job to run Mon1.js immediately
cron.schedule('*/3 * * * *', () => {
  console.log('Executing Mon1.js...');
  runScript('./exe.js');
}, {
  scheduled: true,
  timezone: "UTC"
});

// Cron job to run Mon2.js 3 minutes after Mon1.js
cron.schedule('1-59/3 * * * *', () => {
  console.log('Executing Mon2.js...');
  runScript('./cd.js');
}, {
  scheduled: true,
  timezone: "UTC"
});

console.log('C1 scheduler initialized. Mon1 and Mon2 will be executed as per schedule.');
