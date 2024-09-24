const WebSocket = require('ws');
const { spawn } = require('child_process');

const wss = new WebSocket.Server({ port: 3000 });

console.log('WebSocket Server started on port 3000');

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    const shell = spawn('/bin/bash', [], { shell: true, env: process.env });

    shell.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);

      data = data.toString();

      ws.send(JSON.stringify(data));
    });

    shell.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      
      data = data.toString();

      ws.send(JSON.stringify(data));
    });

    ws.on('message', (message) => {
      try {        
        message = message.toString();
        console.log('received: ', message);

        message = JSON.parse(message);
        if (!message.endsWith('\n')) {
          message += '\n';
        }

        shell.stdin.write(message);
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', () => {
      shell.kill();
    });

    ws.on('error', (err) => {
      console.error(err);
      shell.kill();
    });
});