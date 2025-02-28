    import jwt from "jsonwebtoken"


    export const verifyToken = ({value,sign}) =>{
        return jwt.verify(value, sign)
    }