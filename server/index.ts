import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`[Server] Runing in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`[Health] http://localhost:${PORT}/api/health`);
});
