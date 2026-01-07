import { Config } from '@remotion/cli/config';

Config.setConcurrency(1);
Config.setChromiumHeadlessMode('shell');
Config.setVideoCodec('h264');
Config.setCodecOption('crf', '28');
