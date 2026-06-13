import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

async function main() {
  console.log('🌱 Seeding EarnForge...')

  // Bootstrap Admin
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@earnforge.app'
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ChangeMe123!Secure'
  const adminHash = await bcrypt.hash(adminPass, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', isPro: true },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: 'EarnForge Admin',
      role: 'ADMIN',
      emailVerified: true,
      isPro: true,
      referralCode: generateReferralCode(),
      currentPoints: 100000,
    },
  })

  console.log('Admin ready:', admin.email)

  // Sample Earner
  const earnerHash = await bcrypt.hash('demo1234', 12)
  const earner = await prisma.user.upsert({
    where: { email: 'demo@earnforge.app' },
    update: {},
    create: {
      email: 'demo@earnforge.app',
      passwordHash: earnerHash,
      name: 'Alex Rivera',
      role: 'EARNER',
      emailVerified: true,
      referralCode: generateReferralCode(),
      currentPoints: 1250,
    },
  })

  // Sample Advertiser
  const advHash = await bcrypt.hash('advertiser123', 12)
  const advertiser = await prisma.user.upsert({
    where: { email: 'business@earnforge.app' },
    update: {},
    create: {
      email: 'business@earnforge.app',
      passwordHash: advHash,
      name: 'Acme Offers Inc',
      role: 'ADVERTISER',
      emailVerified: true,
      referralCode: generateReferralCode(),
      currentPoints: 5000,
    },
  })

  // Seed high-quality internal Tasks (no placeholders - real playable)
  const tasks = [
    {
      title: 'Daily Opinion Survey - Tech & Lifestyle',
      description: 'Quick 4-question survey on apps and shopping. Takes ~3 minutes. Attention check included.',
      category: 'SURVEY',
      pointsReward: 180,
      timeEstMinutes: 4,
      requirements: JSON.stringify({
        questions: [
          { id: 'q1', q: 'How often do you shop online?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
          { id: 'q2', q: 'Which mobile OS do you primarily use?', options: ['iOS', 'Android', 'Other'] },
          { id: 'q3', q: 'For quality control, please select "Weekly".', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] }, // attention
          { id: 'q4', q: 'Rate your satisfaction with current finance apps (1-5)', options: ['1', '2', '3', '4', '5'] },
        ],
        attentionCheck: 'q3',
      }),
      dailyCap: 1,
    },
    {
      title: 'Watch & Recall: 60s Brand Video',
      description: 'Watch the short video carefully. Answer 3 quick recall questions at the end to earn.',
      category: 'VIDEO',
      pointsReward: 95,
      timeEstMinutes: 2,
      requirements: JSON.stringify({
        durationSec: 60,
        videoPlaceholder: true, // In real: hosted or YouTube embed with controls disabled
        quiz: [
          { q: 'What color was the main logo?', options: ['Blue', 'Green', 'Red', 'Orange'], correct: 'Green' },
          { q: 'What product was featured?', options: ['Coffee', 'Headphones', 'Sneakers', 'Phone case'], correct: 'Headphones' },
          { q: 'How many seconds did the offer last?', options: ['15', '30', '45', '60'], correct: '30' },
        ],
      }),
      dailyCap: 3,
    },
    {
      title: 'Quick Tap Challenge - Earn While You Play',
      description: 'Tap the targets as fast as you can for 25 seconds. Higher score = full reward. Practice makes perfect.',
      category: 'GAME',
      pointsReward: 120,
      timeEstMinutes: 1,
      requirements: JSON.stringify({
        gameType: 'clicker',
        durationSec: 25,
        targetTapsForFull: 38,
        minTapsPartial: 18,
      }),
      dailyCap: 5,
    },
    {
      title: 'Profile Completion Bonus',
      description: 'Tell us a bit more about yourself so we can match you with higher-paying offers. One-time.',
      category: 'DAILY',
      pointsReward: 350,
      timeEstMinutes: 2,
      requirements: JSON.stringify({
        type: 'profile',
        fields: ['ageRange', 'interests', 'country'],
      }),
      dailyCap: 1,
      lifetimeCap: 1,
    },
    {
      title: 'Micro Task: Quick Product Feedback',
      description: 'Rate 5 product concepts. 90 seconds. High value for brands.',
      category: 'MICRO',
      pointsReward: 65,
      timeEstMinutes: 2,
      requirements: JSON.stringify({
        items: 5,
        scale: '1-5',
      }),
      dailyCap: 4,
    },
  ]

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: 'seed-' + t.category.toLowerCase() },
      update: { ...t, isActive: true },
      create: {
        id: 'seed-' + t.category.toLowerCase(),
        ...t,
        isActive: true,
      } as any,
    })
  }

  console.log('Seeded 5 core tasks + demo users + admin.')

  // Give demo user a little ledger history
  await prisma.earningsLedger.create({
    data: {
      userId: earner.id,
      type: 'EARN',
      amount: 1250,
      balanceAfter: 1250,
      description: 'Welcome bonus + profile starter',
      reference: 'seed-welcome',
    },
  })

  // Sample referral link demo
  await prisma.referral.create({
    data: {
      referrerId: admin.id,
      referredId: earner.id,
      signupBonus: 250,
      totalEarned: 125,
    },
  }).catch(() => {})

  console.log('✅ Seed complete. Login: demo@earnforge.app / demo1234   |   admin@earnforge.app / ChangeMe123!Secure')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
