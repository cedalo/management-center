module.exports = {
    tags: [
        {
            name: 'auth',
            description: 'Endpoints for authentication with the MMC (login, logout)',
        },
    ],
    paths: {
        '/login': {
            get: {
                tags: ['auth'],
                summary: 'Returns an HTML for user page',
                produces: ['html'],
                responses: {
                    200: {
                        description: 'HTML login page',
                        content: {
                            'text/html': {
                                schema: {
                                    $ref: '#/components/schemas/LoginPage',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/logout': {
            get: {
                tags: ['auth'],
                summary: 'Performs logout and redirects to /login (returning the login page)',
                produces: ['application/json'],
                responses: {
                    302: {
                        description: 'Redirect to login page',
                        headers: {
                            Location: {
                                description: '/',
                                schema: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/auth': {
            post: {
                tags: ['auth'],
                requestBody: {
                    description: 'Credentials for authentication',
                    required: 'true',
                    content: {
                        'application/x-www-form-urlencoded': {
                            schema: {
                                type: 'object',
                                properties: {
                                    username: {
                                        type: 'string',
                                    },
                                    password: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
                summary: 'Authenticates user and redirects',
                consumes: ['application/json'],
                produces: ['application/json'],
                responses: {
                    302: {
                        description: 'Redirect on successful authentication or failed authentication',
                        headers: {
                            Location: {
                                description: '/ or /login?error=authentication-failed',
                                schema: {
                                    type: 'string',
                                },
                            },
                            'Set-Cookie': {
                                description:
                                    'If auth sucessful this will be a session cookie that user needs to include into the "Cookie" header for every request to the server',
                                schema: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            LoginPage: {
                type: 'string',
                example: `<!DOCTYPE html>
<html lang='en'>
<head>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica;
            background: #eee;
            width: 100vw;
            height: 100vh;
            background-size: 100% 100%;
            background-color: #d4d6da;
            overflow: hidden;
        }

        h1 {
            text-align: center;
            font-weight: 100;
            font-size: medium;
            color: white;
        }

        #logo-container {
            text-align: center;
            margin-bottom: 2em;
        }

        #link {
            text-align: center;
        }

        #link a {
            text-decoration: none;
            color: #666666;
        }

        #link a:hover {
            text-decoration: underline;
        }

        #container {
            padding-top: 5em;
        }

        #error-container {
            display: none;
            color: red;
            padding: 11px;
            background-color: lightgray;
            text-align: center;
            margin-bottom: 20px;
        }

        form {
            width: 380px;
            margin: 1em auto 4em auto;
            padding: 2em 2em 2em 2em;
            background: #fafafa;
            border: 1px solid #ebebeb;
            box-shadow: rgba(0, 0, 0, 0.14902) 0px 1px 1px 0px, rgba(0, 0, 0, 0.09804) 0px 1px 2px 0px;
        }

        .group {
            position: relative;
            margin-bottom: 45px;
        }

        input {
            font-size: 18px;
            padding: 10px 10px 10px 5px;
            display: block;
            background: #fafafa;
            color: #636363;
            width: 100%;
            border: none;
            border-radius: 0;
            border-bottom: 1px solid #757575;
        }

        input:focus {
            outline: none;
        }


        label {
            color: #999;
            font-size: 18px;
            font-weight: normal;
            position: absolute;
            pointer-events: none;
            left: 5px;
            top: 10px;
            transition: all 0.2s ease;
        }

        input:focus~label,
        input.used~label {
            top: -20px;
            transform: scale(.75);
            left: -2px;
            color: #4a89dc;
        }

        .bar {
            position: relative;
            display: block;
            width: 100%;
        }

        .bar:before,
        .bar:after {
            content: '';
            height: 2px;
            width: 0;
            bottom: 1px;
            position: absolute;
            background: #4a89dc;
            transition: all 0.2s ease;
        }

        .bar:before {
            left: 50%;
        }

        .bar:after {
            right: 50%;
        }


        input:focus~.bar:before,
        input:focus~.bar:after {
            width: 50%;
        }


        .highlight {
            position: absolute;
            height: 60%;
            width: 100px;
            top: 25%;
            left: 0;
            pointer-events: none;
            opacity: 0.5;
        }

        .button {
            position: relative;
            display: inline-block;
            padding: 12px 24px;
            margin: .3em 0 1em 0;
            width: 100%;
            vertical-align: middle;
            color: #fff;
            background: transparent;
            border: 0;
            border-bottom: 2px solid #3160B6;
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 16px;
            line-height: 20px;
            text-align: center;
            letter-spacing: 1px;
        }

        .button:focus {
            outline: 0;
        }

        .buttonBlue {
            background: #4a89dc;
            text-shadow: 1px 1px 0 rgba(39, 110, 204, .5);
        }

        .buttonBlue:hover {
            background: #357bd8;
        }
    </style>
</head>

<body>
    <div id='container'>
        <!-- <div style='width: 100vw; height: 100vh; background-image: url('images/loginbg.png');''> -->
        <form method='POST' action='./auth'>
            <div id='logo-container'><img id='logo' src='images/logo-red.png' width='150px' /></div>
            <div id='error-container'></div>
            <div class='group'>
                <input id='username' type='text' name='username'><span class='highlight'></span><span
                    class='bar'></span>
                <label>Username</label>
            </div>
            <div class='group'>
                <input id='password' type='password' name='password'><span class='highlight'></span><span
                    class='bar'></span>
                <label>Password</label>
            </div>
            <button type='submit' class='button buttonBlue'>Login
                <div class='ripples buttonRipples'><span class='ripplesCircle'></span></div>
            </button>
            <div id='link'><a href='https://cedalo.com' target='_blank'>www.cedalo.com</a></div>
        </form>

        <!-- </div> -->
    </div>
    <script>

        const styleTextField = (textField) => {
            textField.onblur = function () {
                if (this.value) {
                    this.className = 'used'
                } else {
                    this.className = ''
                }
            }
        }

        const styleTextFields = () => {
            const usernameField = document.getElementById('username');
            const passwordField = document.getElementById('password');

            styleTextField(usernameField);
            styleTextField(passwordField);

        }

        const setThemeStyles = async (isDarkMode) => {
            try {
                const response = await fetch('/api/theme');
                const body = await response.json();
                const mode = isDarkMode ? 'dark' : 'light';
                const theme = body[mode];
                const { backgroundColor, logo } = theme.login;
                document.getElementById('logo').src = logo.path;
                document.querySelector('body').style.backgroundColor = backgroundColor;
            } catch (error) {
                console.error(error);
            }
        }

        const isDarkModeEnabled = () => {
            const darkMode = window.localStorage.getItem('cedalo.managementcenter.darkMode');
            return darkMode === 'true';
        }

        document.addEventListener('DOMContentLoaded', (event) => {
            styleTextFields();
            const isDarkMode = isDarkModeEnabled();
            setThemeStyles(isDarkMode);
            window.addEventListener('storage', () => {
                setThemeStyles(isDarkModeEnabled());
            });
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            if (error && error === 'authentication-failed') {
                const errorContainer = document.getElementById('error-container');
                errorContainer.style.display = 'block';
                errorContainer.textContent = 'Authentication failed';
            }
        });
    </script>
</body>

</html>`,
            },
        },
    },
    statuses: {},
};
