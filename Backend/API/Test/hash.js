const bcrypt = require('bcryptjs');

const password = 'itsvishnu@123';

bcrypt.genSalt(10, function(err, salt) {
    if (err) {
        console.error('Error generating salt:', err);
        return;
    }
    bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }
        console.log('Generated hash:', hash);
        // Now, this hash is ready to be stored in the VARCHAR(255) column
    });
});
