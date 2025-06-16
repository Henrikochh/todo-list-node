const db = require('./fw/db');
const crypto = require('crypto');
const { sendMfaCode } = require('./MFA');
const { wrapContent } = require('./utils');
const { escapeHtml } = require('./fw/security');


function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function showLoginPage(req, res, message = '') {
    const html = `
    <h2>Login</h2>
    ${message ? `<p style="color: red;">${escapeHtml(message)}</p>` : ''}
    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password" required>
        </div>
        <div class="form-group">
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
    res.send(await wrapContent(html, req));
}

async function handleLogin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return showLoginPage(req, res, 'Username and password are required.');
    }

    try {
        const users = await db.executeStatement('SELECT id, username, password FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return showLoginPage(req, res, 'Invalid username or password.');
        }

        const user = users[0];
        const hashedPassword = sha256(password);

        if (hashedPassword === user.password) {
            const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
            await sendMfaCode(user.username, mfaCode);

            req.session.mfa_userid = user.id;
            req.session.mfa_username = user.username;
            req.session.mfa_code = mfaCode;
            
            res.redirect('/mfa');
        } else {
            return showLoginPage(req, res, 'Invalid username or password.');
        }
    } catch (e) {
        console.error(e);
        return showLoginPage(req, res, 'An error occurred. Please try again.');
    }
}

async function showMfaPage(req, res, message = '') {
    if (!req.session.mfa_userid) {
        return res.redirect('/login');
    }
    const mfaForm = `
        <h2>Enter MFA Code</h2>
        <p>An email has been sent to you with a verification code.</p>
        ${message ? `<p style="color: red;">${escapeHtml(message)}</p>` : ''}
        <form id="mfa-form" method="post" action="/mfa-verify">
            <div class="form-group">
                <label for="mfaCode">MFA Code</label>
                <input type="text" class="form-control size-medium" name="mfaCode" id="mfaCode" required>
            </div>
            <div class="form-group">
                <input id="submit" type="submit" class="btn size-auto" value="Verify" />
            </div>
        </form>`;
    res.send(await wrapContent(mfaForm, req));
}

async function verifyMfa(req, res) {
    const { mfaCode } = req.body;
    const { mfa_userid, mfa_username, mfa_code } = req.session;

    if (!mfa_userid) {
        return res.redirect('/login');
    }

    if (mfaCode && mfaCode === mfa_code) {
        req.session.loggedin = true;
        req.session.userid = mfa_userid;
        req.session.username = mfa_username;

        delete req.session.mfa_userid;
        delete req.session.mfa_username;
        delete req.session.mfa_code;
        
        res.redirect('/');
    } else {
        await showMfaPage(req, res, 'Incorrect code. Please try again.');
    }
}

module.exports = {
    showLoginPage,
    handleLogin,
    showMfaPage,
    verifyMfa,
};