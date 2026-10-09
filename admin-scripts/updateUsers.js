/** Seed synthetic demo accounts. Dry-run is the default; never overwrites users. */
import { parseArgs } from 'node:util';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, chmod } from 'node:fs/promises';

const { values } = parseArgs({ options: {
  apply: { type: 'boolean', default: false },
  tutors: { type: 'string', default: '20' },
  students: { type: 'string', default: '10' },
  project: { type: 'string' },
  credentials: { type: 'string', default: 'admin-scripts/demo-credentials.local.json' },
  help: { type: 'boolean', default: false },
} });
if (values.help) {
  console.log('npm run seed:users -- [--tutors 20 --students 10] [--apply --project FIREBASE_PROJECT_ID]\nDry-run is the default. Apply requires Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS. New login credentials are saved privately, never printed.');
  process.exit(0);
}
const count = (value, name) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 100) throw new Error(`${name} must be an integer from 0 to 100.`);
  return number;
};
const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Programming', 'Statistics', 'Economics', 'Accounting', 'Business Studies', 'Geography', 'Philosophy'];
const levels = ['Elementary School', 'Middle School', 'High School', 'University', 'Adult Learners'];
const firstNames = ['Alex', 'Morgan', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Sam', 'Robin', 'Avery'];
const lastNames = ['Parker', 'Reed', 'Hayes', 'Brooks', 'Lane', 'Wells', 'Ellis', 'Gray', 'Mills', 'Stone'];
const plan = [];
for (const role of ['tutor', 'student']) {
  const total = count(values[role === 'tutor' ? 'tutors' : 'students'], role);
  for (let i = 0; i < total; i++) {
    const number = String(i + 1).padStart(3, '0');
    const uid = `tutormatch-demo-${role}-${number}`;
    const subject = subjects[i % subjects.length];
    const profile = {
      name: `${firstNames[i % firstNames.length]} ${lastNames[(i + (role === 'student' ? 3 : 0)) % lastNames.length]} ${i >= 10 ? Math.floor(i / 10) + 1 : ''}`.trim(),
      email: `${role}-${number}@tutormatch.example.invalid`,
      role, demo: true, demoVersion: 1,
      photoURL: '', // Uses the repository's existing avatar; no third-party images required.
      availability: ['weekdays', 'weekends', 'evenings', 'flexible'][i % 4],
      bio: role === 'tutor' ? `Demo tutor profile specialising in ${subject}. Patient, structured lessons with practice exercises and clear learning goals.` : 'Demo student profile for exploring the TutorMatch learning workflow.',
      ...(role === 'tutor' ? { subjects: [subject, subjects[(i + 1) % subjects.length]], teachingLevel: levels[i % levels.length], hourlyRate: 18 + (i % 9) * 3 } : { educationLevel: levels[i % levels.length], learningGoals: ['Exam preparation'] }),
    };
    plan.push({ uid, profile });
  }
}

async function run() {
  if (!values.apply) {
    console.log(JSON.stringify({ dryRun: true, tutors: plan.filter(u => u.profile.role === 'tutor').length, students: plan.filter(u => u.profile.role === 'student').length, users: plan }, null, 2));
    return;
  }
  if (!values.project) throw new Error('--project is required with --apply to select the intended Firebase project.');
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
  const app = initializeApp({ credential: applicationDefault(), projectId: values.project });
  const auth = getAuth(app);
  const db = getFirestore(app);
  let credentials = { project: values.project, accounts: [] };
  try { credentials = JSON.parse(await readFile(values.credentials, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (credentials.project !== values.project || !Array.isArray(credentials.accounts)) throw new Error('Credentials file belongs to a different project or is invalid.');
  const saveCredentials = async () => {
    await writeFile(values.credentials, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    await chmod(values.credentials, 0o600);
  };
  await saveCredentials(); // Validate the private output path before any remote writes.
  let created = 0, skipped = 0;
  for (const { uid, profile } of plan) {
    const ref = db.collection('users').doc(uid);
    const existing = await ref.get();
    if (existing.exists) {
      if (existing.data().demo !== true || existing.data().email !== profile.email) throw new Error(`Refusing to overwrite a non-demo profile: ${uid}`);
      const account = await auth.getUser(uid);
      if (account.email !== profile.email) throw new Error(`Authentication mismatch for ${uid}`);
      skipped++;
      continue;
    }
    let account;
    try { account = await auth.getUser(uid); }
    catch (error) { if (error.code !== 'auth/user-not-found') throw error; }
    if (account && account.email !== profile.email) throw new Error(`Refusing to use an existing non-demo account: ${uid}`);
    if (!account) {
      let saved = credentials.accounts.find(item => item.uid === uid);
      if (!saved) {
        saved = { uid, email: profile.email, password: randomBytes(24).toString('base64url') };
        credentials.accounts.push(saved);
        await saveCredentials(); // Preserve retry credentials even if a later write fails.
      }
      await auth.createUser({ uid, email: profile.email, displayName: profile.name, password: saved.password, emailVerified: false });
    }
    await ref.create({ ...profile, createdAt: FieldValue.serverTimestamp() });
    created++;
  }
  console.log(`Done: ${created} demo profiles created, ${skipped} existing demo profiles skipped. Login credentials saved to ${values.credentials}.`);
}
run().catch(error => { console.error(`Demo seeding failed: ${error.message}`); process.exitCode = 1; });
