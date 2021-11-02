if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const server = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const authGoogle = require('./GoogleAuth-config');
const sendEmail = require('./gmailAPI');
const { application } = require('express');


// const initializePassport = require('./passport-config');
// initializePassport(
//     passport,
//     email => users.find(user => user.email === email),
//     id => users.find(user => user.id === id)
// )

const users = [];  // 暫時存取資料，重新整理頁面時會將資料清空 => 之後要在修改連接資料庫

server.set('view-engine','ejs');
server.use(flash());
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
server.use(passport.initialize())
server.use(passport.session())
server.use(methodOverride('_method'))

server.get('/' ,isLoggedIn ,checkAuthenticated,  (request, response) => {
    response.render('../views/index.ejs', {name: request.user.displayName });
})

server.get('/login', checkNotAuthenticated , (request, response) => {
    response.render('../views/login.ejs');
})

server.get('/register', checkNotAuthenticated , (request, response) => {
    response.render('../views/register.ejs');
})

// google登入
server.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}))

// google 驗證失敗
server.get('/auth/google/failure', (request, response) => {
    response.send('Failed to authenticate...');
})

// 登入請求
server.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/auth/email',
    failureRedirect: '/auth/google/failure'
  })
)

// 寄驗證信件
server.get('/auth/email', (request, response) => {
    response.render('../views/authEmail.ejs')
    var User_email = JSON.stringify(request.user.emails).split('"')
    sendEmail(User_email[3]);
})

// 核對驗證碼

// 登出
server.delete('/logout', (request, response) => {
    request.logout();
    response.redirect('/login')
})

// 檢查登入狀況與處理使用者導向
function checkAuthenticated(request, response, next) {
    if(request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login');
}

function checkNotAuthenticated(request, response, next) {
    if(request.isAuthenticated()) {
        return response.redirect('/');
    }
    next()
}

function isLoggedIn(request, response, next) {
    request.user ? next() : response.sendStatus(401);
}

server.listen(3000);


// //註冊請求處理
// server.post('/register', checkNotAuthenticated ,async (request, response) => {
//     try {
//         const hashedPassword = await bcrypt.hash(request.body.password, 10);
//         users.push( {
//             id: Date.now().toString(),
//             name: request.body.name,
//             email: request.body.email,
//             password: hashedPassword
//         })
//         response.redirect('/login')     // 註冊成功，將使用者轉至登入畫面
//     } catch {
//         response.redirect('/register')  //註冊失敗，將使用者重新設定回註冊畫面
//     }
//     console.log(users);
// });