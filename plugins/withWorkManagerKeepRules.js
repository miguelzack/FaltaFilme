const fs = require('node:fs/promises');
const path = require('node:path');
const {withDangerousMod} = require('@expo/config-plugins');

const RULES = `# WorkManager instantiates Room databases and input mergers reflectively.
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class * extends androidx.work.InputMerger { <init>(); }
`;

module.exports = function withWorkManagerKeepRules(config) {
    return withDangerousMod(config, ['android', async (config) => {
        const rulesPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
        let currentRules = '';

        try {
            currentRules = await fs.readFile(rulesPath, 'utf8');
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        const missingRules = RULES.split('\n').filter((rule) => rule && !currentRules.includes(rule));
        if (missingRules.length > 0) {
            await fs.mkdir(path.dirname(rulesPath), {recursive: true});
            await fs.writeFile(rulesPath, `${currentRules.trimEnd()}\n${missingRules.join('\n')}\n`);
        }

        return config;
    }]);
};
