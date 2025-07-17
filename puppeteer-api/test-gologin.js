import { GologinApi } from 'gologin';

const token = 'YOUR_GOLOGIN_API_TOKEN'; // Use your real token
const gologin = GologinApi({ token });

async function main() {
  const profile = await gologin.createProfileRandomFingerprint('TestProfile');
  console.log(profile);
}

main().catch(console.error);
