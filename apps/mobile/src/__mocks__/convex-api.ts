/**
 * Mock for convex/_generated/api used in Jest tests.
 * Must include all modules exposed by the real generated API.
 */
export const api = {
  assets: {
    listByType: {},
    listCelebrityHeads: {},
    seed: {},
  },
  projects: {
    list: {},
    get: {},
    create: {},
    update: {},
    remove: {},
  },
  renders: {
    request: {},
    getStatus: {},
    updateProgress: {},
  },
  sounds: {
    listAll: {},
    listByCategory: {},
    seed: {},
  },
  storage: {
    getUploadUrl: {},
    confirmUpload: {},
    confirmUploadRecord: {},
  },
  uploads: {
    getPresignedUrl: {},
    removeBackground: {},
  },
};
