import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

if (!RemotionRoot) {
  throw new Error('RemotionRoot is undefined!');
}

registerRoot(RemotionRoot);
