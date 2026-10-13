const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const config = require("./index");
const MongoDB = require("../utils/mongodb.util");
const DocGiaService = require("../services/docgia.service");

const isGoogleConfigured = () => {
    return Boolean(config.oauth.google.clientId && config.oauth.google.clientSecret);
};

const isFacebookConfigured = () => {
    return Boolean(config.oauth.facebook.appId && config.oauth.facebook.appSecret);
};

// Cấu hình Google Strategy nếu có đủ Client ID & Secret
if (isGoogleConfigured()) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.oauth.google.clientId,
                clientSecret: config.oauth.google.clientSecret,
                callbackURL: config.oauth.google.callbackURL,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const docGiaService = new DocGiaService(MongoDB.client);
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const hoLot = profile.name?.familyName || "";
                    const ten = profile.name?.givenName || profile.displayName || "Google User";

                    const docGia = await docGiaService.findOrCreateByOAuth({
                        Email: email,
                        HoLot: hoLot,
                        Ten: ten,
                        provider: "google",
                        providerId: profile.id,
                    });

                    return done(null, docGia);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// Cấu hình Facebook Strategy nếu có đủ App ID & Secret
if (isFacebookConfigured()) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: config.oauth.facebook.appId,
                clientSecret: config.oauth.facebook.appSecret,
                callbackURL: config.oauth.facebook.callbackURL,
                profileFields: ["id", "displayName", "emails", "name"],
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const docGiaService = new DocGiaService(MongoDB.client);
                    const email = (profile.emails && profile.emails[0] && profile.emails[0].value)
                        ? profile.emails[0].value
                        : `${profile.id}@facebook.user.com`;
                    const hoLot = profile.name?.familyName || "";
                    const ten = profile.name?.givenName || profile.displayName || "Facebook User";

                    const docGia = await docGiaService.findOrCreateByOAuth({
                        Email: email,
                        HoLot: hoLot,
                        Ten: ten,
                        provider: "facebook",
                        providerId: profile.id,
                    });

                    return done(null, docGia);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

module.exports = {
    passport,
    isGoogleConfigured,
    isFacebookConfigured,
};
