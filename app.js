const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');

const app = express();
const PORT = 3000;

// Middleware for Session-Handling
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Middleware for Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Routen
app.get('/', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
});

app.post('/', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
})

// edit task
app.get('/admin/users', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await adminUser.html, req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// edit task
app.get('/edit', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await editTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// Login-Seite anzeigen
app.get('/login', async (req, res) => {
    await login.handleLogin(req, res);
});

// MFA page to enter the code
app.get('/mfa', async (req, res) => {
    if (!req.session.mfaCode) {
        return res.redirect('/login');
    }
    const mfaForm = `
        <h2>Enter MFA Code</h2>
        <p>An email has been sent to you with a verification code.</p>
        <form id="mfa-form" method="post" action="/mfa-verify">
            <div class="form-group">
                <label for="mfaCode">MFA Code</label>
                <input type="text" class="form-control size-medium" name="mfaCode" id="mfaCode" required>
            </div>
            <div class="form-group">
                <input id="submit" type="submit" class="btn size-auto" value="Verify" />
            </div>
        </form>`;
    let html = await wrapContent(mfaForm, req);
    res.send(html);
});

// MFA verification
app.post('/mfa-verify', async (req, res) => {
    const { mfaCode } = req.body;
    const { mfaCode: sessionMfaCode, userId, username } = req.session;

    if (!sessionMfaCode) {
        return res.redirect('/login');
    }

    if (mfaCode && mfaCode === sessionMfaCode) {
        // MFA correct, start user session
        delete req.session.mfaCode; // Clean up session
        const user = { userid: userId, username: username };
        login.startUserSession(res, user);
    } else {
        // MFA incorrect
        const mfaForm = `
            <h2>Enter MFA Code</h2>
            <p style="color: red;">Incorrect code. Please try again.</p>
            <form id="mfa-form" method="post" action="/mfa-verify">
                <div class="form-group">
                    <label for="mfaCode">MFA Code</label>
                    <input type="text" class="form-control size-medium" name="mfaCode" id="mfaCode" required>
                </div>
                <div class="form-group">
                    <input id="submit" type="submit" class="btn size-auto" value="Verify" />
                </div>
            </form>`;
        let html = await wrapContent(mfaForm, req);
        res.status(401).send(html);
    }
});


// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.cookie('username', '');
    res.cookie('userid', '');
    res.redirect('/login');
});

// Profilseite anzeigen
app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

// save task
app.post('/savetask', async (req, res) => {
    if (activeUserSession(req)) {
        let html = await wrapContent(await saveTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// search
app.post('/search', async (req, res) => {
    let html = await search.html(req);
    res.send(html);
});

// search provider
app.get('/search/v2/', async (req, res) => {
    let result = await searchProvider.search(req);
    res.send(result);
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml + content + footer;
}

function activeUserSession(req) {
    // check if cookie with user information ist set
    console.log('in activeUserSession');
    console.log(req.cookies);
    return req.cookies !== undefined && req.cookies.username !== undefined && req.cookies.username !== '';
}