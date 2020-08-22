const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)) throw new Error('Email address is invalid.');
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if (value.toLowerCase().includes('password')) throw new Error('Password must not contain the word "password".');
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if (value < 0) throw new Error('Age must be a positive number');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id });
    next();
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) throw new Error('Unable to login');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Unable to login');
    return user;
};

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({  _id: this._id.toString() }, process.env.JWTSECRET);
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
};

userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

const User = mongoose.model('User', userSchema);

module.exports = User;