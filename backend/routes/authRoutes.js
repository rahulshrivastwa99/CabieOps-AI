const express = require('express');
const router = express.Router();

// Basic hardcoded auth for demo ops purposes
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'password') {
        // In a real app we would use JWT, here we just return a success token
        return res.json({ success: true, token: 'demo-ops-token-123', user: { role: 'ops_manager', username: 'admin' } });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
