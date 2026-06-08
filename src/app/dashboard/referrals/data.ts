import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"

const REFERRALS_TAG = "referrals"

function hasReferralDelegates() {
  const client = prisma as typeof prisma & {
    customer?: { findMany?: (...args: unknown[]) => unknown }
    referral?: {
      findMany?: (...args: unknown[]) => unknown
      groupBy?: (...args: unknown[]) => unknown
      count?: (...args: unknown[]) => unknown
    }
  }

  return (
    typeof client.customer?.findMany === "function" &&
    typeof client.referral?.findMany === "function" &&
    typeof client.referral?.groupBy === "function" &&
    typeof client.referral?.count === "function"
  )
}

async function loadReferralsData() {
  if (!hasReferralDelegates()) {
    return {
      customers: [],
      recentReferrals: [],
      overview: {
        customers: 0,
        totalReferrals: 0,
        statusOverview: {
          PENDING: 0,
          CONVERTED: 0,
          REWARDED: 0,
          CANCELLED: 0
        }
      },
      setupIssue:
        "The running Prisma client does not include the referral models yet. Regenerate the Prisma client and restart the app server before using this page."
    }
  }

  try {
    const [customers, recentReferrals, referralStatusGroups, totalReferrals] = await Promise.all([
      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          referralsMade: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              referralCodeUsed: true,
              createdAt: true,
              updatedAt: true,
              referredCustomer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  referralCode: true
                }
              }
            }
          },
          loyaltyTransactions: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              pointsChange: true,
              type: true,
              reason: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              referralsMade: true
            }
          }
        }
      }),
      prisma.referral.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          status: true,
          referralCodeUsed: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          referrerCustomer: {
            select: {
              id: true,
              name: true,
              referralCode: true
            }
          },
          referredCustomer: {
            select: {
              id: true,
              name: true,
              referralCode: true
            }
          }
        }
      }),
      prisma.referral.groupBy({
        by: ["status"],
        _count: {
          status: true
        }
      }),
      prisma.referral.count()
    ])

    const statusOverview = {
      PENDING: 0,
      CONVERTED: 0,
      REWARDED: 0,
      CANCELLED: 0
    }

    for (const group of referralStatusGroups) {
      statusOverview[group.status] = group._count.status
    }

    return {
      customers,
      recentReferrals,
      overview: {
        customers: customers.length,
        totalReferrals,
        statusOverview
      },
      setupIssue: null as string | null
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      return {
        customers: [],
        recentReferrals: [],
        overview: {
          customers: 0,
          totalReferrals: 0,
          statusOverview: {
            PENDING: 0,
            CONVERTED: 0,
            REWARDED: 0,
            CANCELLED: 0
          }
        },
        setupIssue:
          "Referral tables are not available in the database yet. Apply the Prisma migration for Customer, Referral, and LoyaltyTransaction before using this page."
      }
    }

    throw error
  }
}

export const getReferralsData = unstable_cache(loadReferralsData, ["referrals-data"], {
  tags: [REFERRALS_TAG]
})

export function getReferralsTag() {
  return REFERRALS_TAG
}

export type ReferralsDashboardData = Awaited<ReturnType<typeof loadReferralsData>>
