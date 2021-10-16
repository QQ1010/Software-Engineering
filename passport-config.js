// local passport
const LocalStrategy = require('passport-local').Strategy

function initializePassword(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email'}), )
}