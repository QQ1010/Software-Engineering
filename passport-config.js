// local passport
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
// import * as bcrypt from 'bcrypt';

function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if(user == null) {
            return done(null, false, {message: "No user with this email."});
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Password incorrenct.'});
            }
        } catch(e) {
            return done(e);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    //序列化用戶
    passport.serializeUser((user,done) => done(null, user.id))
    //反序列化用戶
    passport.deserializeUser((id,done) => { 
        return done(null, getUserById(id))
    });
}

module.exports = initialize