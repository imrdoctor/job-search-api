import mongoose from "mongoose";
import { decryption, encryption, hashing } from "../../../utils/utils.js";
export const defaultproviders = {
    system: "system",
    google: "google"
}
export const defaultavatars = {
    male: "https://res.cloudinary.com/difez8gdw/image/upload/v1738235634/defult_male_lu4h3a.png",
    female: "https://res.cloudinary.com/difez8gdw/image/upload/v1738235635/defult_female_vrp6di.png"
}
export const defaultGenders = {
    male: "male",
    female: "female"
}
export const defaultRoles = {
    user: 'user',
    admin: "admin"
}
export const verfyTypes = {
    otp: 'otp',
    link: "link"
}
export const otpTyps = {
    verfyEmailOtp: 'verfyEmailOtp',
    verfyEmailLink: 'verfyEmailLink',
    forgetPasswordOtp: "forgetPasswordOtp"
}
export const defaultOtpTypes = {
    confirmEmail: "confirmEmail",
    forgotPassword: "forgotPassword",
    changeEmail: "changeEmail"
};
export const defaultAuthTypes = {
    Bearer: "Bearer",
    Admin: "Admin",
};
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        minlength: 2,
        maxlength: 10,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
        minlength: 2,
        maxlength: 7,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider === defaultproviders.google ? false : true;
        },
        minlength: 8,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(defaultGenders),
        default: defaultGenders.male,
    },
    birthdate: {
        type: Date,
        validate: {
            validator: function (value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const monthDiff = today.getMonth() - value.getMonth();
                const dayDiff = today.getDate() - value.getDate();
                return age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
            },
            message: "You must be at least 18 years old."
        }
    },
    phone: {
        type: String,
        required: function () {
            return this.provider === defaultproviders.google ? false : true;
        },
    },
    role: {
        type: String,
        enum: Object.values(defaultRoles),
        default: defaultRoles.user
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    profilePic: {
        secure_url: String,
        public_id: String,
    },
    coverPic: {
        secure_url: String,
        public_id: String,
    },
    provider: {
        type: String,
        enum: Object.values(defaultproviders),
        default: defaultproviders.local,
        required: true
    },
    tokenSecret: {
        type: String,
    },
    resetTokenSecret: {
        type: String,
    },
    OTPs: [
        {
            code: String, // هنا يتخزن مشفر
            type: {
                type: String,
                enum: Object.values(defaultOtpTypes), //لازم يكون واحد من الديفولت اوتبي تايب
                required: true
            },
            expiresIn: {
                type: Date,
                required: true
            }
        }
    ]
})
userSchema.virtual('username').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashing({
            value: this.password,
            saltRounds: parseInt(process.env.BYCRYPTSOLT_ROUNDS)
        });
    }
    if (this.isModified("phone")) {
        this.phone = await encryption({
            value: this.phone,
            key: process.env.ENCRYPTKEY
        });
    }
    next();
});
userSchema.pre(
    ["findOneAndUpdate", "findByIdAndUpdate", "updateOne", "updateMany"],
    async function (next) {
        const phone = this._update.phone || this._update.$set?.phone;
        const password = this._update.password || this._update.$set?.password;

        if (phone) {
            const encryptedPhone = await encryption({
                value: phone,
                key: process.env.ENCRYPTKEY
            });
            if (this._update.phone) this._update.phone = encryptedPhone;
            if (this._update.$set) this._update.$set.phone = encryptedPhone;
        }
        if (password) {
            const hashedPassword = await hashing({
                value: password,
                saltRounds: parseInt(process.env.BYCRYPTSOLT_ROUNDS)
            });
            if (this._update.password) this._update.password = hashedPassword;
            if (this._update.$set) this._update.$set.password = hashedPassword;
        }

        next();
    }
);
userSchema.post(["find", "findOne", "findById"], async function (docs) {
    if (!docs) return;
    if (Array.isArray(docs)) {
        // لو رجع  arry 
        await Promise.all(docs.map(decryptPhone));
    } else {
        await decryptPhone(docs);
    }
});

async function decryptPhone(user) {
    try {
        if (user.phone) {
            user.phone = await decryption({
                value: user.phone,
                key: process.env.ENCRYPTKEY
            });
        }
    } catch (err) {
        console.error("❌ Decryption error:", err);
    }
}
const userModel = mongoose.models.User || mongoose.model("User", userSchema)
export default userModel;
// export const connectionUser = new Map() - socket io - (عشان نجيب الاونلاين )