async function getHeader(req) {
    let username = '';
    if (req.session.loggedin) {
        username = req.session.username;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo List</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <header>
            <h1><a href="/">Todo List</a></h1>
            <nav>
                ${req.session.loggedin ? `
                    <a href="/">Home</a>
                    <a href="/admin/users">Users</a>
                    <span>Welcome, ${username}</span>
                    <a href="/logout">Logout</a>
                ` : `
                    <a href="/login">Login</a>
                `}
            </nav>
        </header>
        <main class="container">
    `;
}

module.exports = getHeader;