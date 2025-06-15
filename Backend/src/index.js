import { app } from './app.js'; 
import connectDB from './db/index.js'; 
import dotenv from 'dotenv'; 

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        const port = process.env.PORT || 8000; 
        app.listen(port, () => {
            console.log(`Backend server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed! ", err);
        process.exit(1); 
    });

