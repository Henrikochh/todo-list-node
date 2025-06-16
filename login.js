const db = require('./fw/db');
const { sendMfaCode } = require('./MFA');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userid': 0 };

    if (typeof req.query.username !== 'undefined' && typeof req.query.password !== 'undefined') {
        let result = await validateLogin(req.query.username, req.query.password);

        if (result.valid) {
            try {
                // Password is correct, send MFA code using username as the email
                await sendMfaCode(result.username, result.mfaCode);

                // Store user info in session for verification
                req.session.mfaCode = result.mfaCode;
                req.session.userId = result.userId;
                req.session.username = result.username;

                // Redirect to the MFA verification page
                res.redirect('/mfa');
                return; // Stop execution here
            } catch (e) {
                msg = "Could not send MFA code. Please try again later.";
            }
        } else {
            msg = result.msg;
        }
    }

    // If login is not initiated or failed, show the login form
    let html = await wrapContent(msg + getHtml(), req);
    res.send(html);
}

function startUserSession(res, user) {
    console.log('login valid... start user session now for userid ' + user.userid);
    res.cookie('username', user.username);
    res.cookie('userid', user.userid);
    res.redirect('/');
}

async function validateLogin(username, password) {
    let result = { valid: false, msg: '', userId: 0, username: null, mfaCode: null };

    // Connect to the database
    const dbConnection = await db.connectDB();

    // Use parameterized query to prevent SQL injection
    const sql = `SELECT id, username, password FROM users WHERE username = ?`;
    try {
        const [results] = await dbConnection.query(sql, [username]);

        if (results.length > 0) {
            const user = results[0];

            // Verify the password
            if (password == user.password) {
                // Generate a 6-digit MFA code
                const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
                result.valid = true;
                result.userId = user.id;
                result.username = user.username;
                result.mfaCode = mfaCode;
            } else {
                // Password is incorrect
                result.msg = 'Incorrect password';
            }
        } else {
            // Username does not exist
            result.msg = 'Username does not exist';
        }
    } catch (err) {
        console.log(err);
        result.msg = 'An error occurred during login.';
    }

    return result;
}

function getHtml() {
    // This is the HTML for the login form
    return `
    <h2>Login</h2>
    <form id="form" method="get" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

// Helper to wrap content with header and footer
async function wrapContent(content, req) {
    const header = require('./fw/header');
    const footer = require('./fw/footer');
    let headerHtml = await header(req);
    return headerHtml + content + footer;
}


module.exports = {
    handleLogin,
    startUserSession
};