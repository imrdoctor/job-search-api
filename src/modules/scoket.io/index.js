import chalk from 'chalk';
import { connectionUser } from '../../DB/models/user/user.model.js';
import { authorizationSocketIo } from '../../middleware/auth.js';
export function mainIo(io) {
    io.on("connection", async (socket) => {
        const auth = socket.handshake.auth;
        const result = await authorizationSocketIo(auth);
    console.log(result);
    
        if (result.statusCode !== 200) {
            console.log(chalk.red(`❌ Connection refused: ${result.message}`));
            return socket.disconnect();
        }
    
        const user = result.user;
        connectionUser.set(socket.id, user._id);
        
        console.log(chalk.green("🟢 User connected: " + socket.id));    
        socket.on('disconnect', () => {
            console.log(chalk.red("🔴 User disconnected: " + socket.id));
            connectionUser.delete(socket.id);
        });
    });    
}