/**
 * Created by frank on 2/1/15.
 */
var Promise = require('promise');

function Authenticator() {
    this.token = null;
}

Authenticator.prototype.authenticate = function (username, password) {
    var self = this;
    return new Promise(function(fulfill, reject){
        self.token = 'token';
        fulfill(self.token);
        return self.token;
    });
};


exports.Authenticator = Authenticator;