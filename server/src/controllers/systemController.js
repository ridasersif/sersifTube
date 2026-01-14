const path = require('path');

exports.browseFolder = (req, res) => {
    if (process.env.DOCKER_MODE === 'true') return res.json({ path: '/downloads' });
    const { exec } = require('child_process');
    // Adjust path to point to root directory folder-picker.ps1 since we are in src/controllers
    const scriptPath = path.join(__dirname, '../../../folder-picker.ps1');

    exec(`powershell.exe -File "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) {
            console.error('Browse Error:', err);
            return res.status(500).json({ error: 'Failed to open folder picker', details: stderr || err.message });
        }
        const pathStr = stdout?.trim();
        if (!pathStr) return res.json({ path: '' }); // Cancelled or empty
        res.json({ path: pathStr });
    });
};
