'use server'

import { prisma } from '@/lib/prisma'

export async function completeTaskAction(formData: FormData, userId: string) {
  const taskId = String(formData.get('taskId'))
  const answersRaw = formData.get('answers') as string | null
  const gameScore = formData.get('gameScore') ? parseInt(String(formData.get('gameScore'))) : null
  const timeTaken = formData.get('timeTaken') ? parseInt(String(formData.get('timeTaken'))) : null

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || !task.isActive) throw new Error('Task not available')

  const ip = 'server'
  const existingToday = await prisma.taskCompletion.count({
    where: {
      userId,
      taskId,
      createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
    },
  })
  if (existingToday >= task.dailyCap) throw new Error('Daily cap reached for this task')

  let points = task.pointsReward
  let status: 'AUTO_APPROVED' | 'PENDING' | 'REJECTED' = 'AUTO_APPROVED'
  let fraud = 0

  if (task.category === 'SURVEY' && answersRaw) {
    const answers = JSON.parse(answersRaw)
    const req = JSON.parse(task.requirements)
    if (req.attentionCheck && answers[req.attentionCheck] !== 'Weekly') {
      status = 'REJECTED'
      points = 0
      fraud = 85
    }
  }

  if (task.category === 'VIDEO' && answersRaw) {
    const answers = JSON.parse(answersRaw)
    const req = JSON.parse(task.requirements)
    let correct = 0
    req.quiz.forEach((q: any, i: number) => {
      if (answers[`q${i}`] === q.correct) correct++
    })
    if (correct < 2) {
      status = 'REJECTED'
      points = Math.floor(points * 0.3)
      fraud = 60
    }
  }

  if (task.category === 'GAME' && gameScore != null) {
    const req = JSON.parse(task.requirements)
    const full = req.targetTapsForFull || 38
    const min = req.minTapsPartial || 18
    if (gameScore >= full) points = task.pointsReward
    else if (gameScore >= min) points = Math.floor(task.pointsReward * 0.6)
    else {
      status = 'REJECTED'
      points = 10
    }
    if (timeTaken && timeTaken < 8) {
      fraud = 70
      status = 'PENDING'
    }
  }

  const completion = await prisma.$transaction(async (tx) => {
    const comp = await tx.taskCompletion.create({
      data: {
        userId,
        taskId,
        status,
        pointsAwarded: points,
        timeTakenSec: timeTaken,
        answers: answersRaw || (gameScore ? JSON.stringify({ score: gameScore }) : null),
        ip,
        fraudScore: fraud,
      },
    })

    if (points > 0) {
      const user = await tx.user.findUnique({ where: { id: userId } })
      const newBal = (user?.currentPoints || 0) + points
      await tx.earningsLedger.create({
        data: {
          userId,
          type: 'EARN',
          amount: points,
          balanceAfter: newBal,
          description: `${task.title} (${task.category})`,
          reference: comp.id,
        },
      })
      await tx.user.update({ where: { id: userId }, data: { currentPoints: newBal } })
    }
    return comp
  })

  if (points > 0) {
    const ref = await prisma.referral.findUnique({ where: { referredId: userId } })
    if (ref) {
      const share = Math.floor(points * ref.earningsShare)
      if (share > 0) {
        await prisma.$transaction(async (tx) => {
          const refUser = await tx.user.findUnique({ where: { id: ref.referrerId } })
          if (refUser) {
            const newRefBal = refUser.currentPoints + share
            await tx.earningsLedger.create({
              data: {
                userId: ref.referrerId,
                type: 'REFERRAL_BONUS',
                amount: share,
                balanceAfter: newRefBal,
                description: `10% from user task`,
                reference: completion.id,
              },
            })
            await tx.user.update({ where: { id: ref.referrerId }, data: { currentPoints: newRefBal } })
            await tx.referral.update({ where: { id: ref.id }, data: { totalEarned: { increment: share } } })
          }
        })
      }
    }
  }

  return { ok: true, points, status }
}

export async function requestPayoutAction(formData: FormData, userId: string) {
  const amountPoints = parseInt(String(formData.get('amountPoints')))
  const method = String(formData.get('method'))
  const destination = String(formData.get('destination'))

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  if (amountPoints < 300 || amountPoints > user.currentPoints) throw new Error('Invalid amount')
  if (!destination) throw new Error('Destination required')

  const fee = Math.floor(amountPoints * 0.08)
  const net = amountPoints - fee
  const usd = (net / 100).toFixed(2)

  await prisma.$transaction(async (tx) => {
    const req = await tx.payoutRequest.create({
      data: {
        userId,
        amountPoints,
        amountUSD: parseFloat(usd),
        method,
        destination,
        feePoints: fee,
        status: user.isPro && amountPoints <= 2000 ? 'PAID' : 'PENDING',
      },
    })

    const newBal = user.currentPoints - amountPoints
    await tx.earningsLedger.create({
      data: {
        userId,
        type: 'PAYOUT_DEBIT',
        amount: -amountPoints,
        balanceAfter: newBal,
        description: `Payout request #${req.id.slice(0,8)}`,
        reference: req.id,
      },
    })
    await tx.user.update({ where: { id: userId }, data: { currentPoints: newBal } })

    if (req.status === 'PAID') {
      await tx.payoutRequest.update({
        where: { id: req.id },
        data: { processedAt: new Date(), txRef: 'AUTO-' + Date.now() },
      })
    }
  })
}
