require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { wrapContent } = require('./utils');
const login = require('./login');
const index = require('./index');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');

const app = express();
const PORT = 3000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Authorization middleware
function requireLogin(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rate limiting
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
app.get('/', requireLogin, async (req, res) => {
    let html = await wrapContent(await index.html(req, res), req);
    res.send(html);
});

app.post('/', requireLogin, async (req, res) => {
    await index.addTask(req, res);
    res.redirect('/');
});

app.get('/edit', requireLogin, async (req, res) => {
    let html = await wrapContent(await editTask.html(req, res), req);
    res.send(html);
});

app.post('/savetask', requireLogin, async (req, res) => {
    await saveTask.save(req, res);
    res.redirect('/');
});

app.post('/search', requireLogin, searchLimiter, async (req, res) => {
    let html = await wrapContent(await search.html(req, res), req);
    res.send(html);
});

// Login and MFA routes
app.get('/login', async (req, res) => {
    await login.showLoginPage(req, res);
});

app.post('/login', async (req, res) => {
    await login.handleLogin(req, res);
});

app.get('/mfa', async (req, res) => {
    await login.showMfaPage(req, res);
});

app.post('/mfa-verify', async (req, res) => {
    await login.verifyMfa(req, res);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
