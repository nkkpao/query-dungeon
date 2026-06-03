export const errorResponseSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: {type: 'string'},
        message: {type: 'string'},
      },
    },
  },
} as const;

export const submissionResponseSchema = {
  type: 'object',
  required: ['submissionId', 'status', 'correctness', 'latencyMs', 'executionTimeMs', 'planningTimeMs', 'rowsReturned', 'errorMessage'],
  properties: {
    submissionId: {type: 'string'},
    status: {type: 'string', enum: ['pending', 'running', 'completed', 'failed']},
    correctness: {type: ['boolean', 'null']},
    latencyMs: {type: ['number', 'null']},
    executionTimeMs: {type: ['number', 'null']},
    planningTimeMs: {type: ['number', 'null']},
    rowsReturned: {type: ['integer', 'null']},
    errorMessage: {type: ['string', 'null']},
  },
} as const;

export const createSubmissionBodySchema = {
  type: 'object',
  required: ['challengeId', 'sql'],
  additionalProperties: false,
  anyOf: [{required: ['participantName']}, {required: ['participantId']}],
  properties: {
    challengeId: {type: 'string', minLength: 1},
    variant: {type: 'string', minLength: 1},
    participantName: {type: 'string', minLength: 1},
    participantId: {type: 'string', minLength: 1},
    sql: {type: 'string', minLength: 1},
    notes: {type: 'string'},
  },
} as const;

export const challengeListResponseSchema = {
  type: 'object',
  required: ['challenges'],
  properties: {
    challenges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'difficulty', 'variants'],
        properties: {
          id: {type: 'string'},
          title: {type: 'string'},
          difficulty: {type: 'string'},
          variants: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'difficulty'],
              properties: {
                id: {type: 'string'},
                title: {type: 'string'},
                difficulty: {type: 'string'},
              },
            },
          },
        },
      },
    },
  },
} as const;

export const leaderboardResponseSchema = {
  type: 'object',
  required: ['challengeId', 'variant', 'entries'],
  properties: {
    challengeId: {type: 'string'},
    variant: {type: ['string', 'null']},
    entries: {
      type: 'array',
      items: {
        type: 'object',
        required: ['submissionId', 'participantName', 'participantId', 'latencyMs', 'executionTimeMs', 'planningTimeMs', 'rowsReturned', 'submittedAt', 'completedAt'],
        properties: {
          submissionId: {type: 'string'},
          participantName: {type: ['string', 'null']},
          participantId: {type: ['string', 'null']},
          latencyMs: {type: ['number', 'null']},
          executionTimeMs: {type: ['number', 'null']},
          planningTimeMs: {type: ['number', 'null']},
          rowsReturned: {type: 'integer'},
          submittedAt: {type: 'string'},
          completedAt: {type: ['string', 'null']},
        },
      },
    },
  },
} as const;
