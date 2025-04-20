const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

// Keep track of current update process and its status
let updateStatus = null;

app.post('/api/funds/update', (req, res) => {
  if (updateStatus && updateStatus.isRunning) {
    return res.status(409).json({ error: 'Update already in progress' });
  }

  updateStatus = {
    isRunning: true,
    current: 0,
    total: 0,
    message: 'Starting update process...'
  };

  const scriptPath = path.join(__dirname, '../scripts/update-funds.js');
  const updateProcess = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      updateStatus = {
        isRunning: false,
        error: error.message
      };
      return;
    }
    
    updateStatus = {
      isRunning: false,
      message: 'Update completed successfully'
    };
  });

  // Listen to script output to update progress
  updateProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Processing')) {
      updateStatus.current++;
      updateStatus.message = `Processing fund ${updateStatus.current} of ${updateStatus.total}...`;
    } else if (output.includes('funds...')) {
      const match = output.match(/Processing (\d+) funds/);
      if (match) {
        updateStatus.total = parseInt(match[1], 10);
      }
    }
  });

  res.status(200).json({ message: 'Update started' });
});

app.get('/api/funds/update-status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    if (!updateStatus) {
      res.write(`data: ${JSON.stringify({ status: 'error', message: 'No update in progress' })}\n\n`);
      return;
    }

    if (updateStatus.error) {
      res.write(`data: ${JSON.stringify({ 
        status: 'error', 
        message: updateStatus.error 
      })}\n\n`);
      return;
    }

    if (!updateStatus.isRunning) {
      res.write(`data: ${JSON.stringify({ 
        status: 'completed', 
        message: updateStatus.message 
      })}\n\n`);
      return;
    }

    res.write(`data: ${JSON.stringify({ 
      status: 'running',
      current: updateStatus.current,
      total: updateStatus.total,
      message: updateStatus.message
    })}\n\n`);
  };

  // Send initial status
  sendStatus();

  // Set up interval to send updates
  const statusInterval = setInterval(sendStatus, 1000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(statusInterval);
  });
});

module.exports = app;